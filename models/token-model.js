import Mongoose from 'mongoose'

const TokenSchema = new Mongoose.Schema({
    user: {type: Mongoose.Schema.Types.ObjectId, ref: 'User'},
    refreshToken: {type: String, required: true}
})

export default Mongoose.model('Token', TokenSchema)