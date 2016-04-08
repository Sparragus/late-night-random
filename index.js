import config from 'config'
import { CronJob } from 'cron'
import Slack from './slack'

const slack = new Slack(config.slack.token)

function parseTime (time) {
  const [ hour, minute ] = time.split(':', 2)
  return { hour, minute }
}

const openingTime = parseTime(config.opening_time)
const openChannelJob = new CronJob(`00 ${openingTime.minute} ${openingTime.hour} * * *`, async function openChannel () {
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
}, null, true)

const closingTime = parseTime(config.closing_time)
const closeChannelJob = new CronJob(`00 ${closingTime.minute} ${closingTime.hour} * * *`, async function closeChannel () {
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
}, null, true)

