import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDb() {
  // Render's IPv6 route to Atlas is unreliable and can surface as a TLS
  // handshake error rather than a plain connection failure; force IPv4.
  await mongoose.connect(config.mongodbUri, { family: 4 });
}

export { mongoose };
