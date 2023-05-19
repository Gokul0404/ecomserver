const mongoose = require('mongoose');
const Schema=mongoose.Schema
const signinSc = new Schema(
  {
    names: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true }
);
 
  

module.exports = mongoose.model("signInData", signinSc);

  
  
