import 'babel-polyfill'
import config from 'config'
import path from 'path'

import Koa from 'koa'

import convert from 'koa-convert'
import logger from 'koa-logger'
import session from 'koa-session'
import views from 'koa-views'
import publicFiles from 'koa-static'

import routes from './routes'

const app = new Koa()

if (process.env.NODE_ENV === 'development') {
  app.use(logger())
}

const publicPath = path.join(__dirname, 'public')
app.use(publicFiles(publicPath, {defer: false}))

const sessionOptions = {
  key: 'latenightrandom'
}
app.keys = config.cookie_secrets
app.use(convert(session(app, sessionOptions)))

const viewsPath = path.join(__dirname, 'views')
app.use(views(viewsPath, {
  extension: 'html',
  map: {
    html: 'swig'
  }
}))

app.use(routes())
app.listen(config.port, () => {
  console.log(`Server listening at port ${config.port}`)
})
