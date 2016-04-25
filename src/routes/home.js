export default async function home (ctx, next) {
  const locals = {
    appInstalled: !!ctx.session.teamId
  }

  await ctx.render('index', locals)
}
