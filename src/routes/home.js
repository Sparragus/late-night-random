export default async function home (ctx, next) {
  const locals = {
    appInstalled: !!ctx.session.accessToken
  }

  await ctx.render('index', locals)
}
