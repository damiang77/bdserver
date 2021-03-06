const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
require('dotenv/config');
const bcrypt = require('bcryptjs');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const UserSchema = mongoose.Schema({
    login: {
      type: String,
      required: true,
      trim: true,
      minlength:4,
      unique:true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength:4,
        unique:true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
      type: String,
      required: true,
      minlength:6 
    },
    tokens: [{
        access: {
            type: String,
            require:true
        },
        token: {
            type: String,
            require:true
        }
    }]
  });

  UserSchema.methods.toJSON = function () {
      var user = this;
      var userObject = user.toObject();
      
      return _.pick(userObject, ['_id', 'email']);
    
  };

  UserSchema.methods.generateAuthToken = function () {
      var user = this;
      var access = 'auth';
      var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.TOKEN_SECRET, { expiresIn: '1h' }).toString();

      user.tokens.push({access, token});

      return user.save().then(()=>{
          return token;
      });
  };

  UserSchema.methods.removeToken = function (token) {
        var user = this;

       return user.update({
            $pull: {
                tokens: {
                    token: token
                }
            }
        });
  }

  UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;
    
    try {
        decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (error) {
        console.log('token expired')
        return Promise.reject();
    }

    return User.findOne ({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'

    })
  }

  UserSchema.statics.findByCredentials = function (email, password) {
      var User = this;
     return User.findOne({email}).then((user)=>{
         if(!user){
             Promise.reject();
         }

         return new Promise((resolve, reject) =>{
            bcrypt.compare(password, user.password, (error, pswdStatus)=>{
                if(pswdStatus){
                    resolve(user);
                } else {
                    reject();
                }
            })
         });
     });
  };

  UserSchema.pre('save', function (next){
    var user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, (error, salt) =>{
            bcrypt.hash(user.password, salt, (error, hash) =>{
                user.password = hash;
                next();
            });
        })
    } else {
        next();
    }
  });

  module.exports = mongoose.model('User', UserSchema);