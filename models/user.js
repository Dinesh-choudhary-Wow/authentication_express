const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'password cannot be empty']
    }
})

// statics-> we can define multiple methods and classes to the model and not to the particular instance

userSchema.statics.findAndValidate = async function(username, password) {
    //were this refers to the particlar model/sechma of user
    const foundUser = await this.findOne({ username })
    const isValid = await bcrypt.compare(password, foundUser.password) // compares the hash password were the foundUser.password we are getting from the database and the password is the current user we fetch from
    return isValid ? foundUser : false;
}

//middleware before (to run some function pre saving ) before the user is saved we verify (save before)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); //if the password is not modeified then this will run and below code is not runned. if password is modified then the below code will run
    this.password = await bcrypt.hash(this.password, 12);
    next(); // this will save the user


})

module.exports = mongoose.model('User', userSchema);