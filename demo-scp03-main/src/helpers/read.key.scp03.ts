import fs from "fs";

// The secret file path must be configured outside source code.
export const readKeySCP03 = async () => {
  const secretsFilePath = process.env.SCP03_SECRETS_FILE;

  if (!secretsFilePath) {
    throw new Error("SCP03_SECRETS_FILE is required");
  }

  const data = await fs.promises.readFile(secretsFilePath, "utf8");

  const secrets: Record<string, string> = {};

  for (const line of data.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");

    if (separator < 1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (key && value) {
      secrets[key] = value;
    }
  }

  const scp03_key_mac = secrets.scp03_key_mac;
  const scp03_key_enc = secrets.scp03_key_enc;
  const scp03_key_dek = secrets.scp03_key_dek;
  const scp03_aid = secrets.scp03_aid;

  if (
    !scp03_key_mac ||
    !scp03_key_enc ||
    !scp03_key_dek ||
    !scp03_aid
  ) {
    throw new Error("Missing required SCP03 key material");
  }

  return {
    scp03_key_mac,
    scp03_key_enc,
    scp03_key_dek,
    scp03_aid,
  };
};
