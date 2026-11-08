"use strict";

import crypto from "crypto";

//ECDH && AES-GCM
class ECDHServer {
  private ecdh: crypto.ECDH;
  private publicKeyBase64: string;
  private sharedKeyBase64: string;

  constructor() {
    this.ecdh = crypto.createECDH("prime256v1");
    const publicKey = this.ecdh.generateKeys();
    this.publicKeyBase64 = publicKey.toString("base64");
  }

  public getPublicKeyBase64(): string {
    return this.publicKeyBase64;
  }

  public computeSharedKey(clientPublicKeyBase64: string): string {
    const clientPublicKey = Buffer.from(clientPublicKeyBase64, "base64");
    const sharedSecret = this.ecdh.computeSecret(clientPublicKey);
    this.sharedKeyBase64 = sharedSecret.toString("base64");
    return this.sharedKeyBase64;
  }

  public async encrypt(data: string): Promise<object> {
    const key = Buffer.from(this.sharedKeyBase64, "base64");
    const iv = crypto.randomBytes(12); // IV cho AES-GCM phải là 12 bytes
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag().toString("base64");
    return {
      iv: iv.toString("base64"),
      encryptedData: encrypted,
      authTag: authTag,
    };
  }

  public async decrypt(encryptedDataObj): Promise<string> {
    const { iv, encryptedData, authTag } = encryptedDataObj;
    const key = Buffer.from(this.sharedKeyBase64, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64"));
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}

export default ECDHServer;
