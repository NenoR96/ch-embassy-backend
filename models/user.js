const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

//baza podataka
const config=require('../config/database');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

module.exports.getUserById=function(id,callback){
    User.findById(id,callback);
}

module.exports.getUserByUserEmail=function(email,callback){
    const query={email:email};
    User.findOne(query,callback);
}

module.exports.updatePass=function(newUserData,callback){
    User.findOne({_id: newUserData._id}, function (err, user) {
        user.password= newUserData.password;
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                if(err)throw err;
                user.password=hash;
                user.save(callback);
            });
        });
    });
}

module.exports.comparePassword=function(candidatePass,hash,callback){
bcrypt.compare(candidatePass,hash,(err,isMatch)=>{
    if(err)throw err;
    callback(null,isMatch);
});
}

//dodavanje novog korisnika
module.exports.addUser=function(newUser,callback){
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err)throw err;
            newUser.password=hash;
            newUser.save(callback);
        });
    });
}
