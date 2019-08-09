const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OTP_schema = new Schema({

    OTP_hash: String,
    user_name: String
})

// create new User document
OTP_schema.statics.create = function (OTP_hash, user_name) {
    const OTPs = new this({
        OTP_hash,
        user_name
    })
    // return the Promise
    return OTPs.save()
}

// find one user by using username
OTP_schema.statics.findOneByOTP = function (OTP_hash) {
    console.log("given has is" + OTP_hash);
    return this.findOne({
        OTP_hash
    }).exec()
}

OTP_schema.statics.deleteByOTP = function (OTP_hash) {
    return this.findOneAndRemove({
        OTP_hash
    })
}




module.exports = mongoose.model('OTP_schema', OTP_schema)