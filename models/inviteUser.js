const mongoose = require("mongoose");

const InviteUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    isMemberInvite: { type: Boolean, default: true },
    isSignStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InviteUser", InviteUserSchema);
