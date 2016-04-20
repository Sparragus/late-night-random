import Router from 'koa-router'
import compose from 'koa-compose'

import oauth from './oauth'
import home from './home'
import * as preferences from './preferences'

export default function () {
  const router = new Router()

  router.get('/', home)
  router.get('/oauth', oauth)
  router.get('/preferences', preferences.get)
  router.post('/preferences', preferences.update)

  return compose([
    router.routes(),
    router.allowedMethods()
  ])
}
