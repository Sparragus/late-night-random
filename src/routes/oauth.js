import config from 'config'
import request from 'request'

import Team from '../models/team'

export default async function (ctx, next) {
  const { code } = ctx.query

  const accessToken = await requestAccessToken(code)
  ctx.assert(accessToken.ok, 500, 'Error getting Slack accessToken.')

  const team = await Team.findOneAndUpdate(
    {id: accessToken.team_id},
    {
      id: accessToken.team_id,
      name: accessToken.team_name,
      accessToken: accessToken.access_token
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).exec()

  ctx.session.teamId = team.id
  ctx.redirect('/settings')
}

function requestAccessToken (code) {
  return new Promise((resolve, reject) => {
    request({
      url: 'https://slack.com/api/oauth.access',
      qs: {
        client_id: config.slack.client_id,
        client_secret: config.slack.client_secret,
        code
      }
    }, function (err, res, body) {
      err ? reject(err) : resolve(JSON.parse(body))
    })
  })
}
