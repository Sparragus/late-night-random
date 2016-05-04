import Router from 'koa-router'
import compose from 'koa-compose'

import oauth from './oauth'
import home from './home'
import * as settings from './settings'

export default function () {
  const router = new Router()

  router.get('/', home)
  router.get('/oauth', oauth)
  router.get('/logout', (ctx, next) => { ctx.session = null; ctx.redirect('/') })
  router.get('/settings', settings.get)
  router.post('/settings', settings.update)

  return compose([
    router.routes(),
    router.allowedMethods()
  ])
}
