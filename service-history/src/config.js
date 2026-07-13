export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4100),
  mongodbUri: process.env.MONGODB_URI || "",
  dbName: process.env.MONGODB_DB_NAME || "service-history",
  internalApiKey: process.env.INTERNAL_API_KEY || "",
};
