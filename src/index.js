import 'babel-polyfill'
import config from 'config'
import { CronJob } from 'cron'
import Slack from './slack'

const slack = new Slack(config.slack.token)

function parseTime (time) {
  const [ hour, minute ] = time.split(':', 2)
  return { hour, minute }
}

const bot = {
  username: 'douglas-crockford',
  as_user: false,
  icon_url: 'https://d1n4bbuvjcnilu.cloudfront.net/attendeeimage/20131213212414-1124.jpg'
}

const openingTime = parseTime(config.opening_time)
const openChannelJob = new CronJob({
  cronTime: `00 ${openingTime.minute} ${openingTime.hour} * * *`,
  onTick: async function openChannel () {
    console.log('Opening the channel')
    // Check if channel exists. If not, create it
    let channel = await slack.getChannelByName(config.channel_name)
    if (!channel) {
      channel = (await slack.createChannel(config.channel_name)).channel
    }

    // If the channel is archived, open it again.
    if (channel.is_archived) {
      await slack.unarchiveChannelByName(config.channel_name)
    }

    slack.sendMessageToChannelByName('random', '@here: #latenightrandom is open!', {parse: 'full', ...bot})
    slack.sendMessageToChannelByName(config.channel_name, '#latenightrandom es un canal que abre de 11pm a 6am! Cuando cierra, borra todos los mensajes y no se puede usar hasta las 11pm.', {parse: 'full', ...bot})
    slack.sendMessageToChannelByName(config.channel_name, 'Lo que pasa en #latenightrandom, se queda en #latenightrandom ;)', {parse: 'full', ...bot})
  },
  start: true,
  timeZone: config.timezone
})

const closingTime = parseTime(config.closing_time)
const closeChannelJob = new CronJob({
  cronTime: `00 ${closingTime.minute} ${closingTime.hour} * * *`,
  onTick: async function closeChannel () {
    console.log('Closing the channel')
    // If the channel doesn't exist, do nothing
    let channel = await slack.getChannelByName(config.channel_name)
    if (!channel) {
      return
    }

    // Delete all the messages
    await slack.deleteAllMessagesFromChannelByName(config.channel_name)

    // Archive the channel
    await slack.archiveChannelByName(config.channel_name)
  },
  start: true,
  timeZone: config.timezone
})
