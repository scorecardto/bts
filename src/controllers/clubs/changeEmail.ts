import {Request, Response} from "express";
import requireAuth from "../../auth/requireAuth";
import {UserSchool} from "../../models/UserSchool";
import {ClubMembership} from "../../models/ClubMembership";

export default async function changeEmail(req: Request, res: Response) {
    const user = await requireAuth(req, res);
    if (!user) return;

    const oldEmail = req.fields?.oldEmail;
    const newEmail = req.fields?.newEmail;
    if (!oldEmail || !newEmail) {
        res.status(400).send("Email cannot be null");
        return;
    }

    const uid = user.uid;

    const userSchool = await UserSchool.findOne({
        where: {
            uid: uid,
        },
    });

    const schoolName = userSchool?.school || null;

    if (!schoolName) {
        res.status(400).send("User not enrolled in Scorecard Social Services");
        return;
    }

    const memberships = await ClubMembership.findAll({
        where: {
            email: oldEmail ? `${oldEmail}` : undefined,
            phone_number: user.phone_number!,
            first_name: userSchool?.first_name || undefined,
            last_name: userSchool?.last_name || undefined,
        }
    })

    for (const membership of memberships) {
        await membership.update({
            email: newEmail ? `${newEmail}` : undefined,
        });
    }

    res.send({
        result: "success",
    });
}