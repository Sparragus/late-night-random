import { WebClient } from '@slack/client'

export default class Slack {
  constructor (token) {
    this.slack = new WebClient(token)
  }

  createChannel (name) {
    return this.slack.channels.create(name)
  }

  async getChannelByName (name) {
    const channelList = await this.slack.channels.list()
    return channelList.channels.find((channel) => channel.name === name)
  }

  async archiveChannelByName (name) {
    const channel = await this.getChannelByName(name)
    return this.slack.channels.archive(channel.id)
  }

  async unarchiveChannelByName (name) {
    const channel = await this.getChannelByName(name)
    return this.slack.channels.unarchive(channel.id)
  }

  async getAllMessagesFromChannelByName (name) {
    const history = []
    const channel = await this.getChannelByName(name)

    const self = this

    async function getMessages (since = 0, until = Date.now()) {
      const messages = await self.slack.channels.history(channel.id, {
        inclusive: true,
        oldest: since,
        latest: until,
        count: 1000
      })

      messages.messages.forEach((message) => history.push(message))

      if (messages.has_more) {
        const oldestMessage = messages.messages[messages.messages.length - 1]
        await getMessages(0, oldestMessage.ts)
      }
    }

    await getMessages()

    return history
  }

  _sleep (ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms)
    })
  }

  async deleteAllMessagesFromChannelByName (name) {
    const channel = await this.getChannelByName(name)
    const messages = await this.getAllMessagesFromChannelByName(name)

    for (var i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]

      try {
        await this.slack.chat.delete(message.ts, channel.id)
      } catch (e) {
        console.error(`Couldn't delete message: [ts = ${message.ts}]`)
        console.error(e)
      }

      // Wait a lil bit so Slack doesn't hate us
      await this._sleep(10)
    }
  }
}
