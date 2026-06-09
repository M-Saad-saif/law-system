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
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "lawyer", "associate"],
      default: "lawyer",
    },
    seniority: {
      type: String,
      enum: ["senior", "junior"],
      default: "senior",
    },
    phone: { type: String, trim: true },
    barCouncilNo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },

    // senior lawyer creates a junior account
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    subscription: {
      isActive: { type: Boolean, default: false },
      plan: {
        type: String,
        enum: ["none", "monthly", "yearly"],
        default: "none",
      },
      status: {
        type: String,
        enum: ["none", "pending", "active", "expired"],
        default: "none",
      },
      startDate: { type: Date },
      endDate: { type: Date },
      transactionId: { type: String, trim: true },
      paymentMethod: { type: String, trim: true }, // jazzcash, easypaisa, bank
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose?.models?.User || mongoose?.model("User", userSchema);

export default User;
