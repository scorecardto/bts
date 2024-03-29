export default function getFriendScore(contact: any): number {
  let points = 0;
  if (contact.addresses != null) {
    points += 10;
  }
  if (contact.birthday != null) {
    if (contact.birthday.year != null && contact.birthday.year > 2000) {
      points += 5;
    } else {
      return 0;
    }
  }

  points += Object.keys(contact).length / 2;

  return points;
}
