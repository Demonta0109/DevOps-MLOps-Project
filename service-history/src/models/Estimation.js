import { mongoose } from "../db.js";

const estimationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  input: {
    surface: Number,
    pieces: Number,
    lat: Number,
    lon: Number,
    code_postal: String,
    adresse: String,
  },
  prixEstime: { type: Number, required: true },
  modelVersion: String,
  createdAt: { type: Date, default: Date.now },
});

export const Estimation = mongoose.model("Estimation", estimationSchema);
