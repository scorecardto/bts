import { UserInfo } from "firebase-admin/lib/auth/user-record";
import admin from "firebase-admin";

export default async function getUsers(): Promise<UserInfo[]> {
  const auth = admin.auth();

  const users = [];
  let pageToken = undefined;

  while (true) {
    const result: any = await auth.listUsers(1000, pageToken);
    users.push(...result.users);

    if (result.pageToken) {
      pageToken = result.pageToken;
    } else {
      break;
    }
  }

  return users;
}
