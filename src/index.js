import 'babel-polyfill'
import config from 'config'
import { CronJob } from 'cron'
import Slack from './slack'

const slack = new Slack(config.slack.token)

function parseTime (time) {
  const [ hour, minute ] = time.split(':', 2)
  return { hour, minute }
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

    slack.sendMessageToChannelByName('random', `@here: #${config.channel_name} is open from ${config.opening_time} to ${config.closing_time}. Join Us!`, {parse: 'full', ...config.bot})
    slack.sendMessageToChannelByName(config.channel_name, `#${config.channel_name} is a channel that opens from ${config.opening_time} to ${config.closing_time}. At closing time, all the messages are deleted and the channel is archived.`, {parse: 'full', ...bot})
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
