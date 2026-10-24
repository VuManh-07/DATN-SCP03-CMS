import dotenv from "dotenv";

dotenv.config();

const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 1005,
  },
  mongodb: {
    url: process.env.DEV_MONGODB_URL_CONNECT,
    name: process.env.DEV_MONGODB_NAME || "fidecDB",
  },
  redis: {
    port: process.env.DEV_REDIS_PORT || 6379,
    host: process.env.DEV_REDIS_HOST || "localhost",
    name: process.env.DEV_REDIS_NAME || "",
    password: process.env.DEV_REDIS_PASSWORD || "",
  },
  rabbitMQ: {
    port: process.env.DEV_RABBIT_MQ_PORT || 0,
    host: process.env.DEV_RABBIT_MQ_HOST || "localhost",
    name: process.env.DEV_RABBIT_MQ_NAME,
    password: process.env.DEV_RABBIT_MQ_PASSWORD,
  },
};

const pro = {
  app: {
    port: process.env.PRO_APP_PORT || 1524,
  },
  mongodb: {
    url: process.env.PRO_MONGODB_URL_CONNECT,
    name: process.env.PRO_MONGODB_NAME || "fidecDB",
  },
  redis: {
    port: process.env.PRO_REDIS_PORT,
    host: process.env.PRO_REDIS_HOST,
    name: process.env.PRO_REDIS_NAME,
    password: process.env.PRO_REDIS_PASSWORD,
  },
  rabbitMQ: {
    port: process.env.PRO_RABBIT_MQ_PORT,
    host: process.env.PRO_RABBIT_MQ_HOST,
    name: process.env.PRO_RABBIT_MQ_NAME,
    password: process.env.PRO_RABBIT_MQ_PASSWORD,
  },
};

const config = { dev, pro };
const env = process.env.NODE_ENV || "dev";

export default config[env];

