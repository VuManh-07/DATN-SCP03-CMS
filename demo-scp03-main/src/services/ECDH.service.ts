"use strict";

import crypto from "crypto";

class ECDHServer {
  private ecdh: crypto.ECDH;
  private publicKeyBase64: string;
  private sharedKeyBase64?: string;

  constructor() {
    this.ecdh = crypto.createECDH("prime256v1");
    this.publicKeyBase64 = this.ecdh.generateKeys().toString("base64");
  }

  public getPublicKeyBase64(): string {
    return this.publicKeyBase64;
  }

  public computeSharedKey(clientPublicKeyBase64: string): string {
    if (!clientPublicKeyBase64 || typeof clientPublicKeyBase64 !== "string") {
      throw new Error("Client public key is required");
    }

    const publicKey = Buffer.from(clientPublicKeyBase64, "base64");

    if (publicKey.length !== 33 && publicKey.length !== 65) {
      throw new Error("Invalid ECDH public key length");
    }

    try {
      const sharedSecret = this.ecdh.computeSecret(publicKey);
      this.sharedKeyBase64 = sharedSecret.toString("base64");
      return this.sharedKeyBase64;
    } catch {
      throw new Error("Invalid ECDH public key");
    }
  }

  private getKey(): Buffer {
    if (!this.sharedKeyBase64) {
      throw new Error("ECDH shared key has not been established");
    }

    const key = Buffer.from(this.sharedKeyBase64, "base64");

    if (key.length !== 32) {
      throw new Error("Invalid AES-256 key length");
    }

    return key;
  }

  public async encrypt(data: string): Promise<object> {
    const key = this.getKey();
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const ciphertext = Buffer.concat([
      cipher.update(data, "utf8"),
      cipher.final(),
    ]);

    return {
      iv: iv.toString("base64"),
      encryptedData: ciphertext.toString("base64"),
      authTag: cipher.getAuthTag().toString("base64"),
    };
  }

  public async decrypt(encryptedDataObj: {
    iv: string;
    encryptedData: string;
    authTag: string;
  }): Promise<string> {
    const key = this.getKey();

    if (
      !encryptedDataObj ||
      typeof encryptedDataObj.iv !== "string" ||
      typeof encryptedDataObj.encryptedData !== "string" ||
      typeof encryptedDataObj.authTag !== "string"
    ) {
      throw new Error("Invalid encrypted payload");
    }

    const iv = Buffer.from(encryptedDataObj.iv, "base64");
    const authTag = Buffer.from(encryptedDataObj.authTag, "base64");

    if (iv.length !== 12 || authTag.length !== 16) {
      throw new Error("Invalid AES-GCM IV or authentication tag");
    }

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encryptedDataObj.encryptedData, "base64")),
      decipher.final(),
    ]);

    return plaintext.toString("utf8");
  }
}

export default ECDHServer;
