
const dbconnection = require('../models/dbconnection');
const User = require('../models/User');
const _ = require('lodash');

exports.user_create = async (req, res) =>{
    try {
        const user = new User({
            login: req.body.login,
            email: req.body.email,
            password: req.body.password
            // tokens: {
            //     access: req.body.tokens.access,
            //     token: req.body.tokens.token
            // }
        });

        await user.save().then(()=>{
            return user.generateAuthToken();
        }).then((token)=>{
            res.header('x-auth', token).send(user);
        }).catch(error => res.status(400).json(error));

    } catch (error) {
        res.status(400).json({message: error})
    }
  
};

exports.user_private = (req, res) => {
  res.send(req.user);
}

exports.user_login = (req, res) =>{
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user)=>{
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth', token).send(user);
        })
    }).catch((error)=>{
        res.status(401).send(error)
    });
}


exports.user_logout = (req, res) =>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    }, ()=>{
        res.status(400).send();
    });
}