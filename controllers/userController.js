const InviteUser = require("../models/inviteUser");
const User = require("../models/user");
const nodemailer = require("nodemailer");

exports.getUserById = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("_id name email");
    return res.status(200).json({
      success: true,
      message: "user find successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getUserByName = async (req, res) => {
  try {
    const name = req.body.name;
    let user = [];
    if (name.length === 0) {
      user = await User.find().select("_id name email");
    } else {
      user = await User.find({
        name: { $regex: name, $options: "i" },
      }).select("_id name email");
    }

    return res.status(200).json({
      success: true,
      message: "user find successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.edit = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateFields = {};

    if (req.body.name) {
      updateFields.name = req.body.name;
    }

    if (req.body.email) {
      // Check if email already exists for another user
      const emailExists = await User.findOne({
        email: req.body.email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      updateFields.email = req.body.email;
    }

    // Only update if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true }
      ).select("_id name email");

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    }

    return res.status(400).json({
      success: false,
      message: "No fields to update",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find().select("_id name email isAdmin");
    return res.status(200).json({
      success: true,
      message: "users list find successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId, { new: true }).select(
      "_id name email isAdmin"
    );
    return res.status(200).json({
      success: true,
      message: "users delete successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    console.log(req.body);
    const { email } = req.body;
    console.log(email);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // // Check if user exists
    const ExistUser = await InviteUser.findOne({ email });

    if (ExistUser)
      return res.status(404).json({
        success: false,
        message: "User is already invited",
      });

    const user = await User.findOne({ email });
    if (user)
      return res.status(404).json({
        success: false,
        message: "User is already registered",
      });

    await InviteUser.create({ email });

    // Email Options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Invite Membership",
      text: `i want please join group`,
    };

    // Send OTP via Email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "invite successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getAllPendingInvites = async (req, res) => {
  try {
    const user = await InviteUser.find({ isSignStatus: false });
    return res.status(200).json({
      success: true,
      message: "Pending Invites users list find successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.deleteInvitePendingUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await InviteUser.findByIdAndDelete(userId, { new: true });
    return res.status(200).json({
      success: true,
      message: "users delete successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getPendingInviteUserByEmail = async (req, res) => {
  try {
    const name = req.body.name;
    let user = [];
    if (name.length === 0) {
      user = await InviteUser.find({ isSignStatus: false });
    } else {
      user = await InviteUser.find({
        email: { $regex: name, $options: "i" },
        isSignStatus: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "user find successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
