import twilio from "twilio";
import phone from "phone";
import axios from "axios";
export default async function sendMessage(
  message: string,
  phoneNumber: string
): Promise<any> {
  const phoneNumberFormatted = phone(phoneNumber);

  if (!phoneNumberFormatted.isValid) {
    throw new Error("invalid phone number");
  }

  const apiKey = process.env.POSTACK_API_KEY;
  const fromPhoneNumber = process.env.POSTACK_PHONE_NUMBER;

  axios.post(
    "https://api.postack.dev/v1/messages/sms",
    {
      from: fromPhoneNumber,
      to: phoneNumber,
      text: "this is a test",
    },
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );

  // const authToken = process.env.TWILIO_AUTH_TOKEN;
  // const client = twilio(accountSid, authToken);

  // let success = false;
  // let resultMessage = "";
  // try {
  //   const result = await client.messages.create({
  //     body: message,
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to: phoneNumberFormatted.phoneNumber,
  //   });

  //   success = true;
  // } catch (e: any) {
  //   console.error(e);

  //   success = false;
  //   resultMessage = e.message ?? "";
  // }

  const t: any = {
    message,
    phone_number: phoneNumberFormatted.phoneNumber,
    success: true,
    result: "",
  };

  return t;
}
