export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4100),
  mongodbUri: process.env.MONGODB_URI || "",
  internalApiKey: process.env.INTERNAL_API_KEY || "",
};
