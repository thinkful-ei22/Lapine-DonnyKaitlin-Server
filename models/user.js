'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  words:{type:Object,default:null}
});

userSchema.set('toObject', {
  virtuals: true, // built in virtual id
  versionKey: false, // remove _v
  transform: (doc, ret) => {
    delete ret._id, // delete '_id'
    delete ret.password;
  }
});

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
}

module.exports = mongoose.model('User', userSchema);