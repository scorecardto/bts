import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { Club as ClubModel } from "../../models/Club";
import getUserSchool from "../../private/school/getUserSchool";
import { Club } from "scorecard-types";
import { ClubMembership } from "../../models/ClubMembership";
import { Sequelize } from "sequelize";
import { UserSchool } from "../../models/UserSchool";
import { School } from "../../models/School";
export default async function searchClubs(req: Request, res: Response) {
  const clubCode = `${req.query.clubCode}`;
  const preferSchool = `${req.query.preferSchool}`;

  console.log(clubCode);

  const clubs: any[] = (
    await ClubModel.findAll({
      where: [
        {
          ticker: clubCode.toUpperCase(),
        },
      ],
      include: [
        {
          model: UserSchool,
          attributes: ["first_name", "last_name"],
        },
        // {
        //   model: School,
        //   attributes: ["display_name", "short_code"],
        // },
      ],
    })
  ).map((cm) => {
    // @ts-ignore
    const { first_name, last_name } = cm.dataValues.UserSchool;
    // @ts-ignore
    // const { display_name, short_code } = cm.dataValues.School;

    return {
      clubName: cm.name,
      clubCode: cm.ticker,
      ownerName: `${first_name} ${last_name.substring(0, 1)}`,
      // schoolCode: short_code,
      // schoolName: display_name,
      clubPicture: JSON.parse(cm.metadata).picture ?? "",
    };
  });

  if (clubs.length === 0) {
    res.status(404).send("No club with this ticker found");
    return;
  }

  if (clubs.length > 1 && preferSchool) {
    const singleClub = clubs.find((c, i) => {
      return c.schoolCode === preferSchool;
    });

    if (singleClub)
      return res.send({
        result: "success",
        clubs: [singleClub],
      });
  }

  return res.send({
    result: "success",
    clubs,
  });
}
