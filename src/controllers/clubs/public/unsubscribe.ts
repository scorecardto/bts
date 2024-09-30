import { Request, Response } from "express";
import { ClubUnsubscribeLink } from "../../../models/ClubUnsubscribeLink";
import { ClubEmailEnrollment } from "../../../models/ClubEmailEnrollment";
import { ClubMembership } from "../../../models/ClubMembership";
import { ClubPost } from "../../../models/ClubPost";

export default async function unsubscribe(req: Request, res: Response) {
  const unsubscribeCode = req.fields?.code;
  const allClubs = req.fields?.allClubs;

  const unsubscribeLink = await ClubUnsubscribeLink.findOne({
    where: {
      code: unsubscribeCode,
    },
  });

  if (!unsubscribeLink) {
    res.status(404).send("Link not valid");
    return;
  }

  if (allClubs) {
    await ClubMembership.destroy({
      where: {
        email: unsubscribeLink.email,
      },
    });
    await ClubEmailEnrollment.destroy({
      where: {
        email: unsubscribeLink.email,
      },
    });
    res.send({
      result: "success",
    });
    return;
  } else {
    const clubPost = await ClubPost.findOne({
      where: {
        id: unsubscribeLink.post,
      },
    });

    if (!clubPost) {
      res.status(404).send("Post not found");
      return;
    }
    await ClubMembership.destroy({
      where: {
        email: unsubscribeLink.email,
        club: clubPost.club,
      },
    });
    await ClubEmailEnrollment.destroy({
      where: {
        email: unsubscribeLink.email,
        club: clubPost.club,
      },
    });
    res.send({
      result: "success",
    });
    return;
  }
}
