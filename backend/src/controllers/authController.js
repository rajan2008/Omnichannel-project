import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/userSchema.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: `"Infotact" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Infotact OTP Code",
    html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
};

// Seed first admin — only works if NO admin exists
export const seedAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: "admin", isVerified: true });
    if (adminExists) return res.status(403).json({ message: "Admin already exists" });

    const { name, email, password, phone } = req.body;
    const otp = generateOtp();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    const existing = await User.findOne({ email });
    if (existing) {
      existing.name = name; 
      if (password) existing.password = password;
      existing.role = "admin"; existing.otp = otp; existing.otpExpire = otpExpire;
      if (phone) existing.phone = phone;
      await existing.save();
    } else {
      await User.create({ name, email, password, phone, role: "admin", otp, otpExpire });
    }

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "Admin OTP sent. Verify to activate admin account." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 1: Register — public, role always cashier
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(400).json({ message: "Email already registered" });

    const otp = generateOtp();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    if (existing) {
      existing.name = name;
      if (password) existing.password = password;
      existing.role = "cashier"; // force cashier always
      existing.otp = otp;
      existing.otpExpire = otpExpire;
      if (phone) existing.phone = phone;
      await existing.save();
    } else {
      await User.create({ name, email, password, phone, role: "cashier", otp, otpExpire });
    }

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "OTP sent to email. Please verify to complete registration." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Login API
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account first" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin creates manager/admin/cashier — OTP goes to that user's email
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!["admin", "manager", "cashier"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });

    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = generateOtp();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    if (existing) {
      existing.name = name;
      if (password) existing.password = password;
      existing.role = role;
      existing.otp = otp;
      existing.otpExpire = otpExpire;
      if (phone) existing.phone = phone;

      await existing.save();
    } else {
      await User.create({
        name,
        email,
        password,
        phone,
        role,
        otp,
        otpExpire,
      });
    }

    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: `${role} account created. OTP sent to ${email}`,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 2: Verify OTP — mark user as verified, return JWT
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpire < new Date()) return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged in user profile (Protected Route for Rajan's work)

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpire");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};