import config from 'config'
import { CronJob } from 'cron'
import moment from 'moment-timezone'

import Slack from './slack'
import Team from './models/team'

function openTimezones () {
  const timezones = moment.tz.names()
  return timezones.filter((timezone) => {
    const time = moment().tz(timezone)
    const beginningOfDay = time.clone().startOf('day')
    const hoursSinceStartOfDay = time.diff(beginningOfDay, 'hours', true)

    return hoursSinceStartOfDay >= 23 || hoursSinceStartOfDay < 6
  })
}

async function openChannel (team) {
  const slack = new Slack(team.accessToken)

  let channel = await slack.getChannelByName(config.channel_name)
  if (!channel) {
    channel = (await slack.createChannel(config.channel_name)).channel
  }

  // If the channel is archived, open it again.
  if (channel.is_archived) {
    await slack.unarchiveChannelByName(config.channel_name)
  }

  team.channelIsOpen = true
  team.save()

  // slack.sendMessageToChannelByName('random', `@here: #${config.channel_name} is open from ${config.opening_time} to ${config.closing_time}. Join Us!`, {parse: 'full', ...config.bot})
  // slack.sendMessageToChannelByName(config.channel_name, `#${config.channel_name} is a channel that opens from ${config.opening_time} to ${config.closing_time}. At closing time, all the messages are deleted and the channel is archived.`, {parse: 'full', ...bot})
}

async function closeChannel (team) {
  const slack = new Slack(team.accessToken)

  // If the channel doesn't exist, do nothing
  let channel = await slack.getChannelByName(config.channel_name)
  if (!channel) {
    return
  }

  // Delete all the messages
  // TODO: Should this be enabled?
  // await slack.deleteAllMessagesFromChannelByName(config.channel_name)

  // Archive the channel
  await slack.archiveChannelByName(config.channel_name)

  team.channelIsOpen = false
  team.save()
}

async function openOrCloseChannels () {
  console.log('opening/closing channels')
  const timezones = openTimezones()

  const teamsToOpenPromise = Team.find({
    channelIsOpen: false,
    timezone: {
      $in: timezones
    }
  }).exec()

  const teamsToClosePromise = Team.find({
    channelIsOpen: true,
    timezone: {
      $nin: timezones
    }
  }).exec()

  const [teamsToOpen, teamsToClose] = await Promise.all([teamsToOpenPromise, teamsToClosePromise])

  teamsToOpen.forEach((team) => {
    openChannel(team)
  })

  teamsToClose.forEach((team) => {
    closeChannel(team)
  })
}

const EVERY_FIFTEEN_MINUTES = '00 */15 * * * *'
const openOrCloseChannelsJob = new CronJob({
  cronTime: EVERY_FIFTEEN_MINUTES,
  onTick: openOrCloseChannels,
  start: false,
  timeZone: config.timezone
})

export default openOrCloseChannelsJob
