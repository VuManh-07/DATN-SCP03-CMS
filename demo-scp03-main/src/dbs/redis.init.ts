"use strict";

import { createClient } from "redis";
import configEnv from "../configs/config.env";

const redisUsername = configEnv.redis.name || "default";
const redisPassword = configEnv.redis.password || "";

const redisAuth = redisPassword
  ? `${encodeURIComponent(redisUsername)}:${encodeURIComponent(redisPassword)}@`
  : "";

const connectStr = `redis://${redisAuth}${configEnv.redis.host}:${configEnv.redis.port}`;

let instanceConnectRedis;
let connectTimeOut: NodeJS.Timeout | null = null;
const statusConnectRedis = {
  CONNECT: "connect",
  END: "end",
  RECONNECT: "reconnecting",
  ERROR: "error",
};

const REDIS_CONNECT_TIMEOUT = 10000;
const REDIS_CONNECT_MESSAGE = {
  code: -99,
  message: {
    vn: "Redis loi",
    en: "Redis error",
  },
};

const handleTimeoutError = (): void => {
  console.log("Setting timeout for Redis connection");
  if (connectTimeOut) {
    clearTimeout(connectTimeOut);
  }
  connectTimeOut = setTimeout(() => {
    console.log("Redis connection timeout reached");
    console.error("Redis reconnect timeout");
  }, REDIS_CONNECT_TIMEOUT);
};

const clearConnectTimeout = (): void => {
  if (connectTimeOut) {
    clearTimeout(connectTimeOut);
    connectTimeOut = null;
  }
};

const handleEventConnection = (connectRedis): void => {
  console.log("handle even");
  connectRedis.on(statusConnectRedis.CONNECT, async () => {
    console.log("connect redis - Connect status: connected");
    clearConnectTimeout();
  });

  connectRedis.on(statusConnectRedis.END, () => {
    console.log("connect redis - Connect status: disconnect");
    clearConnectTimeout();
  });

  connectRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log("connect redis - Connect status: reconnecting");

    // connect retry
    handleTimeoutError();
  });

  connectRedis.on(statusConnectRedis.ERROR, () => {
    console.log(`connect redis - Connect status: error`);
  });
};

const initRedis = async () => {
  const instance = createClient({ url: connectStr });
  handleEventConnection(instance);
  await instance.connect();
  instanceConnectRedis = instance;
};

const getRedis = () => {
  if (!instanceConnectRedis) {
    throw new Error("Redis connection needs to be open.");
  }
  return { instanceConnectRedis };
};

const closeRedis = async () => {
  if (instanceConnectRedis) {
    instanceConnectRedis.disconnect();
  }
  clearConnectTimeout();
};

export { initRedis, getRedis, closeRedis };

