const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  userType: { type: String, enum: ["farmer", "expert"] }, // differentiate
});

module.exports = mongoose.model("User", UserSchema);
