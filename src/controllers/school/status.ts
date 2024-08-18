import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { School } from "../../models/School";
import { UserSchool } from "../../models/UserSchool";
import { UserClass } from "../../models/UserClass";
import { Club } from "../../models/Club";
import { ClubMembership } from "../../models/ClubMembership";

export default async function updateSchoolStatus(req: Request, res: Response) {
  const {
    schoolName,
    districtHost,
    gradeLevel,
    studentFirstName,
    studentLastName,
    realFirstName,
    realLastName,
    schedule,
  } = req.fields ?? {};

  const user = await requireAuth(req, res);
  if (!user) return;

  const uniqueSchoolName = `${districtHost}-${schoolName}`;

  const school = await School.findOne({
    where: [
      {
        unique_name: uniqueSchoolName,
      },
    ],
  });

  if (!school) {
    await School.create({
      unique_name: uniqueSchoolName,
      district_host: `${districtHost}`,
      name: `${schoolName}`,
      verified: false,
    });
  }

  const existingUserSchool = await UserSchool.findOne({
    where: [
      {
        uid: user.uid,
      },
    ],
  });

  const schoolFields = {
    school: uniqueSchoolName,
    first_name: `${studentFirstName}`,
    last_name: `${studentLastName}`,
    real_first_name: `${realFirstName}`,
    real_last_name: `${realLastName}`,
    np_grade_level: `${gradeLevel}`,
    schedule: `${schedule}`,
  };

  let shouldAddSchedule = !existingUserSchool;
  let shouldReplaceSchedule = false;

  if (existingUserSchool) {
    if (existingUserSchool.schedule !== schedule) {
      shouldAddSchedule = true;
      shouldReplaceSchedule = true;
    }
    await existingUserSchool.update(schoolFields);
  } else {
    await UserSchool.create({
      uid: user.uid,
      ...schoolFields,
    });
  }

  if (shouldReplaceSchedule) {
    await UserClass.destroy({
      where: {
        user: user.uid,
      },
    });
  }
  if (shouldAddSchedule) {
    await UserClass.bulkCreate(
      JSON.parse(`${schedule}`).map((classInfo: any): any => ({
        user: user.uid,
        course_key: classInfo.course_key,
        period: classInfo.period,
        // room_number: classInfo.room_number,
        name: classInfo.name,
        teacher: classInfo.teacher,
      }))
    );
  }

  const clubs: {
    name: string;
    posts: string[];
    id: number;
    owned: boolean;
  }[] = [];

  const ownedClubs = await Club.findAll({
    where: [
      {
        owner: user.uid,
      },
    ],
  });

  const joinedClubs = await Club.findAll({
    include: [
      {
        model: ClubMembership,
        where: { phone_number: user.phone_number },
      },
    ],
  });

  clubs.push(
    ...ownedClubs.map((c) => {
      return {
        name: c.name,
        posts: [],
        id: c.id,
        owned: true,
      };
    })
  );

  clubs.push(
    ...joinedClubs.map((c) => {
      return {
        name: c.name,
        posts: [],
        id: c.id,
        owned: false,
      };
    })
  );

  res.send({
    result: "success",
    status: {
      clubs,
    },
  });
}
