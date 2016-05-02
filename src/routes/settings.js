import Team from '../models/team'

export async function get (ctx, next) {
  if (!ctx.session || !ctx.session.teamId) {
    // TODO: Error flash message
    ctx.session.flash = {
      type: 'error',
      text: 'You need to log in.'
    }

    return ctx.redirect('/')
  }

  const flash = {...ctx.session.flash}
  ctx.session.flash = {}

  const team = await Team.findOne({id: ctx.session.teamId}).exec()
  await ctx.render('settings', {
    timezone: team.timezone,
    flash
  })
}

export async function update (ctx, next) {
  if (!ctx.session || !ctx.session.teamId) {
    // TODO: Error flash message
    ctx.session.flash = {
      type: 'error',
      text: 'You need to log in.'
    }
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

  ctx.session.flash = {
    type: 'success',
    text: 'Timezone updated'
  }

  return ctx.redirect('/settings')
}
