import { mongoose } from "../db.js";

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  estimationId: { type: mongoose.Schema.Types.ObjectId, ref: "Estimation", required: true },
  note: String,
  createdAt: { type: Date, default: Date.now },
});

export const Favorite = mongoose.model("Favorite", favoriteSchema);
