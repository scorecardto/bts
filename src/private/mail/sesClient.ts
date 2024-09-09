import { SESClient } from "@aws-sdk/client-ses";
import dotenv from "dotenv";

dotenv.config();

const SES_CONFIG = {
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY!,
  },
  region: process.env.SES_REGION!,
};

console.log(SES_CONFIG);

const sesClient = new SESClient(SES_CONFIG);

export default sesClient;
