const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const InviteUser = require("../models/inviteUser");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    const user = await User.create({ name, email, password });
    const inviteUser = await InviteUser.findOneAndUpdate(
      { email },
      {
        $set: {
          isSignStatus: true,
        },
      }
    );

    console.log("inviteUser", inviteUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5d",
      }
    );
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 1️⃣ Send OTP to User's Email
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // 📌 Generate 6-digit OTP
    const generateOTP = () =>
      Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    // Generate OTP and expiry time (10 minutes from now)
    const otp = generateOTP();
    const otpExpires = new Date(
      Date.now() + parseInt(process.env.OTP_EXPIRES_IN, 10) * 60000
    );

    // Save OTP to user record
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.isOtpVerified = false; // Mark OTP as not yet verified
    await user.save();

    // Email Options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    // Send OTP via Email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ✅ 2️⃣ Verify OTP (Allow Password Reset if Correct)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user and check OTP
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        suuccess: false,
        message: "User not found",
      });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark OTP as verified
    user.isOtpVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ✅ 3️⃣ Reset Password (Only After OTP Verification)
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find user and check OTP verification
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    if (!user.isOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified. Please verify OTP first.",
      });
    }

    user.password = newPassword;

    // Clear OTP fields
    user.otp = null;
    user.otpExpires = null;
    user.isOtpVerified = false;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password, currentPassword } = req.body;

    const user = await User.findOne({ email: req.user.email });

    if (!user || !(await user.matchPassword(currentPassword)))
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });

    user.password = password;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
