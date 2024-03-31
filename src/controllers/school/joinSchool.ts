import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import { School } from "../../models/School";
import { UserSchool } from "../../models/UserSchool";
import { UserClass } from "../../models/UserClass";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import { NullishPropertiesOf } from "sequelize/types/utils";

export default async function joinSchool(req: Request, res: Response) {
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

  const userSchool = await UserSchool.create({
    uid: user.uid,
    school: uniqueSchoolName,
    first_name: `${studentFirstName}`,
    last_name: `${studentLastName}`,
    real_first_name: `${realFirstName}`,
    real_last_name: `${realLastName}`,
    np_grade_level: `${gradeLevel}`,
  });

  await UserClass.bulkCreate(
    JSON.parse(`${schedule}`).map((classInfo: any): any => ({
      user: user.uid,
      course_key: classInfo.course_key,
      period: classInfo.period,
      room_number: classInfo.room_number,
    }))
  );

  res.send({
    result: "success",
  });
}
