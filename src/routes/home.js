export default async function home (ctx, next) {
  const flash = {...ctx.session.flash}
  ctx.session.flash = {}

  const locals = {
    appInstalled: !!ctx.session.teamId,
    flash
  }

  await ctx.render('index', locals)
}
