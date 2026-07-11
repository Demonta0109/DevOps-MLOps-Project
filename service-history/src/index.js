import "dotenv/config";
import { app } from "./app.js";
import { connectDb } from "./db.js";
import { config } from "./config.js";

await connectDb();

app.listen(config.port, () => {
  console.log(`service-history listening on port ${config.port}`);
});
