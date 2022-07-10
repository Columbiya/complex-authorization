import Mongoose from 'mongoose'

const UserSchema = new Mongoose.Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, required: true, default: false},
    activationLink: {type: String}
})

export default Mongoose.model("User", UserSchema)