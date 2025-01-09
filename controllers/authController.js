const bcryptjs = require("bcryptjs");
const User = require("../models/userModel");
const Token = require("../models/tokenModel")
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

require("dotenv").config();

// Register User
const RegisterUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    const result = await user.save();

    res.status(201).json({
      message: "User Registered Successfully",
      accessToken: user.generateAccessToken(),
      refreshToken,
      user: {
        id: result._id,
        username: result.username,
        email: result.email,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login User
const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Correct way to check password with bcryptjs
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    res
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure:'production',
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: 'production',
    })
    .status(200).json({
      message: "User Logged In Successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get USer Profile
const getUserProfile = async(req,res) => {
  try {
    const user = await User.findById(req.params.id);

    res
    .status(200).json({
      message: "User Profile Fetched Successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
   }
}

// Send OTP on Email
const sendOtpEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); 
    const token = new Token({
      userId: user._id,
      token: otp,
    });

    await token.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP for Verification",
      text: `Your OTP is ${otp}. It will expire in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP email" });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tokenRecord = await Token.findOne({ userId: user._id, token: otp });
    if (!tokenRecord) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid
    user.verified = true; 
    await user.save();
    await tokenRecord.deleteOne(); 

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Refresh Access Token
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh Token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid Refresh Token" });
    }

    const accessToken = user.generateAccessToken();
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    res.status(403).json({ message: "Invalid or Expired Refresh Token" });
  }
};

// Logout User
const LogoutUser = async (req, res) => {
  const { id } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Valid User ID is required" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  getUserProfile,
  sendOtpEmail,
  verifyOtp,
  refreshAccessToken,
  LogoutUser,
};
