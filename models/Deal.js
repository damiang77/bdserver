const mongoose = require("mongoose");
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const DealSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  oldPrice: {
    type: String,
    required: true
  },
  image: String,
  date: {
    type: Date,
    default: Date.now
  },
  points: {
    type: Number,
    required: false,
    default: 0
  },
  uservote: [
    {
      user: {
        type: String
      },
      vote: {
        type: String
      }
    }
  ],
  user: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

DealSchema.statics.addVote = async function(id, user, vote) {
  if (vote === 1 || vote === -1) {
    let deal = this;
    let userVotedOnId = await deal.findOne({ _id: id, "uservote.user": user });
    if (!userVotedOnId) {
      const updatedDeal = await deal.findOneAndUpdate(
        { _id: id },
        {
          $inc: { points: vote },
          $push: {
            uservote: {
              user: user,
              vote: vote
            }
          }
        }
      );
      return updatedDeal;
    }
  }
  return 0;
};

DealSchema.statics.removeVote = async function(id, user) {
  let deal = this;
  let userVotedOnId = await deal.findOne({ _id: id, "uservote.user": user });
  const vote = userVotedOnId.uservote.toObject({getters:true});
  const getVote = vote.find(usr => usr.user == user).vote;
  const options = { new: true }; 
  if (userVotedOnId) {
    const updatedDeal = await deal.findOneAndUpdate(
      { _id: id },
      { $inc: { points: -getVote },
        $pull: {
          uservote: {
            user: user
          }
        }
      },options
    );
    if(updatedDeal){
      return getVote;
    }else{
      throw new err;
      
    }
  }
  return 0;
};

DealSchema.statics.deals_user = async function(user) {
  let deal = this;
  const allDealsVoted = await deal.find({"uservote.user": user}, {uservote: 0}).lean();
  // for(var i in allDeals){
  //   Object.assign(allDeals[i], {vote: "true"})
  // }
  const allDeals = await deal.find({}, {uservote: 0}).lean();

  for(let i in allDeals){
    Object.assign(allDeals[i], {vote: "false"})
    for(let j in allDealsVoted){
      if(allDeals[i]._id.toString() === allDealsVoted[j]._id.toString()){
        Object.assign(allDeals[i], {vote: "true"})
      } 
    }
  }
  return allDeals;
};

DealSchema.statics.deal_user = async function(id, user) {
  let deal = this;
  try{
    let userVotedOnId = await deal.findOne({ _id: id, "uservote.user": user }, {uservote: 0}).lean();
    if(userVotedOnId){
      Object.assign(userVotedOnId, {vote: "true"})
    }
    return userVotedOnId;
  } catch(e){
    console.log(e)
    return 0
  }

};

module.exports = mongoose.model("Deal", DealSchema);
