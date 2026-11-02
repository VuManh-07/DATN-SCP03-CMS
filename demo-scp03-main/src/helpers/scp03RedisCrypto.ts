import crypto from "crypto";

const PREFIX = "enc:v1:";

const SENSITIVE_FIELDS = [
  "Key_MAC",
  "Key_ENC",
  "Key_DEK",
  "host_Key_MAC",
  "host_Key_ENC",
  "host_Key_DEK",
  "host_S_MAC",
  "host_S_ENC",
  "host_S_RMAC",
  "host_MacChaining",
  "host_ICV",
  "host_hostCryptogram",
  "host_cardCryptogram",
  "card_cardCryptogram",
  "sharedSecret",
];

function getEncryptionKey(): Buffer {
  const configured = process.env.SCP03_REDIS_ENCRYPTION_KEY;

  if (!configured) {
    throw new Error("SCP03_REDIS_ENCRYPTION_KEY is required");
  }

  const key = Buffer.from(configured, "base64");

  if (key.length !== 32) {
    throw new Error("Redis encryption key must be 32 bytes");
  }

  return key;
}

function encryptValue(value: string, field: string): string {
  if (value.startsWith(PREFIX)) return value;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    iv
  );

  cipher.setAAD(Buffer.from(field, "utf8"));

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return PREFIX + [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

function decryptValue(value: string, field: string): string {
  if (!value.startsWith(PREFIX)) {
    throw new Error("Legacy plaintext SCP03 session detected");
  }

  const parts = value.slice(PREFIX.length).split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted session format");
  }

  const [iv, tag, ciphertext] = parts.map(
    (part) => Buffer.from(part, "base64")
  );

  if (iv.length !== 12 || tag.length !== 16) {
    throw new Error("Invalid encrypted session metadata");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    iv
  );

  decipher.setAAD(Buffer.from(field, "utf8"));
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

export function sealSensitiveFields<T extends object>(entity: T): T {
  const record = entity as Record<string, any>;

  for (const field of SENSITIVE_FIELDS) {
    const value = record[field];

    if (typeof value === "string" && value.length > 0) {
      record[field] = encryptValue(value, field);
    }
  }

  return entity;
}

export function unsealSensitiveFields<T extends object>(entity: T): T {
  const record = entity as Record<string, any>;

  for (const field of SENSITIVE_FIELDS) {
    const value = record[field];

    if (typeof value === "string" && value.length > 0) {
      record[field] = decryptValue(value, field);
    }
  }

  return entity;
}
