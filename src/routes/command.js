import config from 'config'

export default async function command (ctx, next) {
  /*
    Commands

    help
      Prints a list of available commands
    timezone TIMEZONE
      Set the timezone for the app.
    invite YES/NO
      Sends an invite the user when the channel opens
   */

  const body = ctx.request.body
  ctx.assert(body.token === config.slack.token, 403, 'Invalid token')

  ctx.status = 200
  ctx.type = 'json'
  help(ctx, next)
}

function help (ctx, next) {
  ctx.body = `#LateNightRandom Help:\n
/latenightrandom help
  \t Print all the commands available
/latenightrandom timezone TIMEZONE
  \t Set the timezone for your app. Substitue TIMEZONE with a valid timezone from this list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  \t TIMEZONE should be a value like: America/Mexico_City
`
}
