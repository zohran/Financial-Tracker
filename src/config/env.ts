export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  mongodb: {
    uri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
    db: process.env.MONGODB_DB ?? "financial_tracker",
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev_access_secret_change_me",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret_change_me",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },

  bcrypt: {
    saltRounds: 10,
  },
} as const;
