import Team from '../models/team'

export async function get (ctx, next) {
  if (!ctx.session || !ctx.session.teamId) {
    // TODO: Error flash message
    return ctx.redirect('/')
  }

  const team = await Team.findOne({id: ctx.session.teamId}).exec()
  await ctx.render('settings', {
    timezone: team.timezone
  })
}

export async function update (ctx, next) {
  if (!ctx.session || !ctx.session.teamId) {
    // TODO: Error flash message
    return ctx.redirect('/')
  }

  const { timezone } = ctx.request.body
  if (timezone !== '') {
    await Team.findOneAndUpdate(
      {id: ctx.session.teamId},
      {
        timezone
      },
      {
        new: true
      }
    ).exec()
  }

  return ctx.redirect('/settings')
}
