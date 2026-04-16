import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    otp: { type: String },
    otpExpire: { type: Date },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["admin", "manager", "cashier"], default: "cashier" },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  },
  { timestamps: true },
);

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
}

export default mongoose.model("User", userSchema);
