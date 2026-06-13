import mongoose from "mongoose";

const chamberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const Chamber =
  mongoose?.models?.Chamber || mongoose?.model("Chamber", chamberSchema);

export default Chamber;
