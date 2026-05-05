import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import OTP from "../models/otpSchema.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// 1. Send Registration OTP
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    await OTP.findOneAndUpdate(
      { email },
      { otp: hashedOTP, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    await sendEmail({
      email,
      subject: "Your Registration OTP",
      message: `Your OTP for registration is: ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Complete Registration (with OTP)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, otp, store } = req.body;

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord || otpRecord.otp !== hashedOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "cashier",
      store,
      isEmailVerified: true 
    });

    await OTP.deleteOne({ email });
    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2b. Direct Registration (no OTP — used by frontend Register page)
export const directRegister = async (req, res) => {
  try {
    const { name, email, password, phone, store } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "cashier",
      store,
      isEmailVerified: true
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("store");

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    res.status(200).json({
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        phone: user.phone, 
        store: user.store,
        avatar: user.avatar
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Creates User
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, role, store } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, role, store, isEmailVerified: true });
    
    // Populate store before sending back
    const populatedUser = await User.findById(user._id).populate("store");

    res.status(201).json({
      message: `${role} account created successfully.`,
      user: { 
        id: populatedUser._id, 
        name: populatedUser.name, 
        email: populatedUser.email, 
        role: populatedUser.role,
        store: populatedUser.store 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("store");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Profile (NO OTP for email/phone change as per user request)
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.email && req.body.email !== user.email) {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) return res.status(400).json({ message: "Email already in use" });
      user.email = req.body.email;
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    // Populate store before sending back to avoid frontend crashes
    const populatedUser = await User.findById(updatedUser._id).populate("store");

    res.status(200).json({
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      phone: populatedUser.phone,
      store: populatedUser.store,
      avatar: populatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate("store").select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update User
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
    user.store = req.body.store || user.store;

    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    // Populate store for instant frontend update
    const populatedUser = await User.findById(updatedUser._id).populate("store");
    
    res.status(200).json({ message: "User updated successfully", user: populatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Admin Logic: Can delete anyone (even other admins)
    if (req.user.role === "admin") {
      // Prevent deleting self to avoid lockouts
      if (req.user.id.toString() === req.params.id.toString()) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      await user.deleteOne();
      return res.status(200).json({ message: "User deleted successfully" });
    }

    // 2. Manager Logic: Can only delete their own store's staff (Cashiers)
    if (req.user.role === "manager") {
      // Managers cannot delete Admins or other Managers
      if (user.role === "admin" || user.role === "manager") {
        return res.status(403).json({ message: "Managers can only manage Cashier accounts" });
      }

      // Check store matching
      const managerStore = req.user.store?.toString();
      const userStore = user.store?.toString();

      if (!managerStore || managerStore !== userStore) {
        return res.status(403).json({ message: "Unauthorized: Staff belongs to a different location" });
      }

      await user.deleteOne();
      return res.status(200).json({ message: "User deleted successfully" });
    }

    return res.status(403).json({ message: "Permission denied" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    const message = `Password Reset Link: ${resetUrl}`;

    // Always log reset link to console as fallback
    console.log("\n=== PASSWORD RESET LINK ===");
    console.log(`User: ${user.email}`);
    console.log(`Link: ${resetUrl}`);
    console.log("===========================\n");

    try {
      await sendEmail({ email: user.email, subject: "Password Reset Token", message });
      res.status(200).json({ message: "Reset link sent to your email. Also check your backend console." });
    } catch (_emailError) {
      // Email failed but reset token is still valid — user can use the console link
      console.warn("Email send failed, but reset link is available in console above.");
      res.status(200).json({ message: "Reset link generated. Check your backend terminal console for the link." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = req.file.path.replace(/\\/g, "/");
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate("store");
    res.status(200).json({
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      phone: populatedUser.phone,
      store: populatedUser.store,
      avatar: populatedUser.avatar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};