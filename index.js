import 'babel-polyfill'
import config from 'config'
import { WebClient } from '@slack/client'

const slack = new WebClient(config.slack.token, {logLevel: 'debug'})
// slack.channels.create('latenightrandom').then(() => {
//   return slack.chat.postMessage('latenightrandom', 'Welcome to #latenightrandom!')
// })
// setTimeout(function () {
//   slack.channels.archive('latenightrandom')
// }, 5000)
