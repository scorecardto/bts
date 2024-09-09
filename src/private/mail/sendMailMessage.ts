import { SendBulkTemplatedEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { ClubPost } from "scorecard-types";
import sesClient from "./sesClient";
import sanitize from "sanitize-html";

function clean(content: string) {
  return sanitize(content, {
    allowedTags: [],
    allowedAttributes: false,
  });
}
export default async function sendMailMessage(
  to: string[],
  post: ClubPost
): Promise<any> {
  let template = post.club.picture
    ? "club_post_notification_with_pfp"
    : "club_post_notification";

  const templateData: any = {
    content: clean(post.content),
    club_name: clean(post.club.name),
    // i guess just trust this
    club_code: post.club.clubCode,
    club_picture: post.club.picture,
  };

  if (post.picture) {
    templateData["picture"] = post.picture;
    template = post.club.picture
      ? "club_post_notification_with_image_pfp"
      : "club_post_notification_with_image";
  }

  const sendTemplatedEmailCommand = new SendBulkTemplatedEmailCommand({
    Destinations: to.map((a) => {
      return {
        Destination: {
          ToAddresses: [a],
        },
      };
    }),
    Source: `${post.club.name} <${process.env.SES_SENDER!}>`,
    Template: template,
    DefaultTemplateData: JSON.stringify(templateData),
  });

  try {
    const res = await sesClient.send(sendTemplatedEmailCommand);
    console.log(res);
  } catch (e) {
    console.error(e);
  }

  console.log("sending");
}
