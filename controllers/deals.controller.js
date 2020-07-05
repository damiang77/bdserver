const dbconnection = require("../models/dbconnection");
const Deal = require("../models/Deal");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
require("dotenv/config");
const multer = require("multer");

exports.deals_create =  async (req, res) => {


    const userId = req.user._id;
    const userName = await User.findOne({_id: userId})

    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
          cb(null, 'uploads/')
        },
        filename: function(req, file, cb) {
          console.log(file)
          cb(null, file.originalname)
        }
      })
    const upload = multer({ storage }).single('image')

    upload(req, res, function(err) {
        if (err) {
          console.log(err)
          return res.send(err)
        }
        console.log('file uploaded to server')
        console.log(req.file)
    
        cloudinary.config({
            cloud_name: process.env.CLOUD,
            api_key: process.env.APIKEY,
            api_secret: process.env.APISECRET
          });
        
        const path = req.file.path;
    
        cloudinary.uploader.upload(
          path,
          async function(err, image) {
            if (err) {
              console.log(err);
              return res.send(err);
            }
            console.log('file uploaded to Cloudinary');
            // remove file from server
            const fs = require('fs');
            fs.unlinkSync(path);
          
            const deal = new Deal({
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                oldPrice: req.body.oldPrice,
                image: image.secure_url,
                user: userName.login,
                url: req.body.url
            })
            try {
                const savedDeal = await deal.save();
                res.json(savedDeal);
            } catch (error) {
                res.status(400).json({message: error})
            }
          }
        )
      })

};

exports.deals_read = async (req, res) => {
  try {
    const deals = await Deal.find({}, { uservote: 0 });
    res.json(deals);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.deals_read_user = async (req, res) => {
  let user = req.user._id;
  console.log(user);
  try {
    const deals = await Deal.deals_user(user);
    res.json(deals);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.deals_readId = async (req, res) => {
  try {
    const deal = await Deal.findOne({_id: req.params.id}).select('-uservote -comments.userId -comments._id');
    res.json(deal);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.deal_user = async (req, res) => {
  let user = req.user._id;
  console.log(user);
  try {
    const deal = await Deal.deal_user(req.params.id, user);
    if(deal===0){
      res.status(400).json({'Error': 'ID or User doesnt exist'})
    }else{
      res.json(deal);
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.deals_delete = async (req, res) => {
  try {
    const removedDeal = await Deal.deleteOne({ _id: req.params.id });
    res.json(removedDeal);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.deals_update = async (req, res) => {
  try {
    const updatedDeal = await Deal.updateOne(
      { _id: req.params.id },
      { $set: { title: req.body.title } }
    );
    res.json(updatedDeal);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.deals_addvote = (req, res) => {
  let id = req.params.id;
  let user = req.user._id;
  let vote = req.body.vote;
  console.log(vote);
  Deal.addVote(id, user, vote)
    .then(voted => {
      if (voted === 0) {
        res.status(400);
      }
      res.json(voted);
    })
    .catch(err => {
      res.status(400).json({ message: error });
      console.log(err);
    });
};



exports.deal_user_addComment = async (req, res) => {
  let id = req.params.id;
  let userId = req.user._id;
  let userName = await User.findOne({_id: userId})
  let comment = req.body.comment;

  Deal.addComment(id, userId, userName.login, comment)
    .then(commented => {
      if (commented === 0) {
        res.status(400);
      }
      res.json(commented);
    })
    .catch(err => {
      res.status(400).json({ err });
      console.log(err);
    });
};




exports.deals_removevote = (req, res) => {
  let id = req.params.id;
  let user = req.user._id;
  Deal.removeVote(id, user)
    .then(removedVote => {
      if (removedVote === 0) {
        res.status(400);
      }
      res.json(removedVote);
    })
    .catch(err => {
      res.status(400).json({ message: error });
      console.log(err);
    });
};

exports.deals_decrement = async (req, res) => {
  try {
    const updatedDeal = await Deal.updateOne(
      { _id: req.params.id },
      { $inc: { points: -1 } }
    );
    res.json(updatedDeal);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
