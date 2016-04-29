import 'babel-polyfill'
import config from 'config'
import job from './cronjobs'
import server from './server'

job.start()
server.listen(config.port, () => {
  console.log(`Server listening at port ${config.port}`)
})
