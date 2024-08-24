import { Request, Response } from "express";
import requireAuth from "../../auth/requireAuth";
import getUserSchool from "../../private/school/getUserSchool";
import getUIDDirectory from "../../private/school/getUIDDirectory";
import getContacts from "../../private/contacts/getContacts";
import getNoContactSuggestions from "../../private/contacts/getNoContactSuggestions";
import getYesContactSuggestions from "../../private/contacts/getYesContactSuggestions";
import polishFriendSuggestions from "../../private/contacts/polishFriendSuggestions";
import getPopularity from "../../private/contacts/getPopularity";

export default async function suggestFriends(req: Request, res: Response) {
  const { contacts, firstName } = req.fields ?? {};

  const user = await requireAuth(req, res);
  if (!user) return;

  if (user.phone_number == null) {
    res.status(400).send("No phone number found");
    return;
  }

  const uid = user.uid;
  const schoolName = await getUserSchool(uid);

  if (!schoolName) {
    res.status(400).send("User not enrolled in Scorecard Social Services");
    return;
  }

  const uidDirectory = await getUIDDirectory(schoolName);
  const allContacts = await getContacts();

  const suggestionsRaw = await getYesContactSuggestions(
    // @ts-ignore
    { uid: uid, phone_number: user.phone_number },
    allContacts[uid].contacts,
    allContacts,
    uidDirectory
  );
  // const suggestionsRaw = await getYesContactSuggestions(
  //   user,
  //   allContacts[user.uid].contacts,
  //   allContacts,
  //   uidDirectory
  // );

  const suggestions = await polishFriendSuggestions(
    suggestionsRaw,
    user.phone_number
  );
  // const suggestions = await getNoContactSuggestions(
  //   user,
  //   allContacts,
  //   uidDirectory
  // );

  console.log(suggestions);

  res.send(schoolName);
}
