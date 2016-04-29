import mongoose from 'mongoose'

const Team = mongoose.Schema({
  id: {type: String, required: true, unique: true},
  name: {type: String},
  accessToken: {type: String, required: true},
  timezone: {type: String, default: 'UTC'}, // TODO: Validate timezone
  channelIsOpen: {type: Boolean, default: false}
})

export default mongoose.model('Team', Team)
