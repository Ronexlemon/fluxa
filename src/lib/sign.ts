import { Wallet } from "ethers";
import { Buffer } from "buffer";

// Function
export async function decodeSignEncode(base64Data: string, privateKey: string) {
  // 1. Decode Base64
  const jsonString = Buffer.from(base64Data, "base64").toString("utf-8");
  const data = JSON.parse(jsonString);

  console.log("Decoded Payment Required:", data);

return data
}
