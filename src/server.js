import config from 'config'
import path from 'path'

import Koa from 'koa'

import convert from 'koa-convert'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import session from 'koa-session'
import views from 'koa-views'
import publicFiles from 'koa-static'

import routes from './routes'

import mongoose from 'mongoose'

// Configure Database
mongoose
  .connect(config.mongodb.uri, config.mongodb.options)
  .connection
  .once('open', () => console.log(`MongoDB up and running at ${config.mongodb.uri}`))
  .on('error', (err) => {
    console.error(`Cannot connect to MongoDB: ${err.message}`)
    throw err
  })
  .on('close', () => console.log('Lost connection to MongoDB'))

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

app.use(bodyParser())
app.use(routes())

export default app
