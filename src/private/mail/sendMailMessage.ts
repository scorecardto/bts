import { SendBulkTemplatedEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { ClubPost } from "scorecard-types";
import sesClient from "./sesClient";
import sanitize from "sanitize-html";
import { ClubUnsubscribeLink } from "../../models/ClubUnsubscribeLink";

function clean(content: string) {
  return sanitize(content, {
    allowedTags: [],
    allowedAttributes: false,
  });
}
export default async function sendMailMessage(
  to: ClubUnsubscribeLink[],
  post: ClubPost,
  subject: string
): Promise<any> {
  let template = "v3_club_post_notification";

  const templateData: any = {
    content: clean(post.content),
    club_name: clean(post.club.name),
    subject: clean(subject || ""),
    // i guess just trust this
    club_code: post.club.clubCode,
    club_picture_url: post.club.picture
      ? `https://api.scorecardgrades.com/v1/images/get/${post.club.picture}`
      : `https://scorecardgrades.com/api/image?source=clubPicture&internalCode=${post.club.internalCode}`,
  };

  if (post.picture) {
    templateData[
      "picture_url"
    ] = `https://api.scorecardgrades.com/v1/images/get/${post.picture}`;
    template = "v3_club_post_notification_with_image";
  }

  const sendTemplatedEmailCommand = new SendBulkTemplatedEmailCommand({
    Destinations: to.map((a) => {
      return {
        ReplacementTemplateData: JSON.stringify({
          unsubscribe_link: `https://www.scorecardgrades.com/unsubscribe/${a.code}`,
        }),
        Destination: {
          ToAddresses: [a.email],
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
