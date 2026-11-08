import fs from "fs";
import path from "path";

// Đường dẫn đến tệp chứa các key secret
const secretsFilePath = path.join("/home/ubuntu/.ssh", "secrets_keys_scp03");

export const readKeySCP03 = async () => {
  let scp03_key_mac: string | undefined,
    scp03_key_enc: string | undefined,
    scp03_key_dek: string | undefined,
    scp03_aid: string | undefined;

  try {
    // Kiểm tra quyền đọc tệp
    await fs.promises.access(secretsFilePath, fs.constants.R_OK);
    console.log("Tệp có thể đọc được.");

    // Đọc tệp
    const data = await fs.promises.readFile(secretsFilePath, "utf8");

    // Hiển thị nội dung tệp
    console.log("Nội dung của tệp secrets_keys_scp03:");
    console.log(data);

    // Phân tích cú pháp nội dung tệp nếu cần
    const secrets: any = data.split("\n").reduce((acc, line) => {
      const [key, value] = line
        .split("=")
        .map((part) => part.trim().replace(/^'|'$/g, ""));
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Sử dụng key secret
    console.log("Key secret 1:", secrets);
    scp03_key_mac = secrets.scp03_key_mac;
    scp03_key_enc = secrets.scp03_key_enc;
    scp03_key_dek = secrets.scp03_key_dek;
    scp03_aid = secrets.scp03_aid;
  } catch (err) {
    console.error("Lỗi khi đọc tệp secrets_keys_scp03:", err);
  }

  return { scp03_key_mac, scp03_key_enc, scp03_key_dek, scp03_aid };
};
