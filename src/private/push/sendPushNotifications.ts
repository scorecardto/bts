import getFirebase from "../../firebase/getFirebase";
import getExpo from "./getExpo";
import {ExpoPushMessage, ExpoPushToken} from "expo-server-sdk";

export default async function sendPushNotifications(clubCode: string, title: string,
                                                    body: string, firebaseTokens: (string | undefined)[]) {
    const collection = await getFirebase().firestore().collection("pushTokens").get();

    let expoTokens = firebaseTokens.map(t => {
        const doc = collection.docs.find(d => d.id === t);
        if (doc) return doc.data().token;
        else return undefined;
    })

    const expo = await getExpo();

    const failed = [];

    const messageIds = [] as number[];
    const messages = [] as ExpoPushMessage[];
    expoTokens.forEach((token, i) => {
        if (token) {
            messages.push({
                to: token,
                title,
                body,
                data: {clubCode}
            });
            messageIds.push(i);
        } else {
            failed.push(i);
        }
    })

    const tickets = [];
    for (const chunk of expo.chunkPushNotifications(messages)) {
        tickets.push(...(await expo.sendPushNotificationsAsync(chunk)));
    }

    for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].status === "error") {
            await getFirebase().firestore().collection("pushTokens").doc(messages[i].to as string).delete();
            failed.push(messageIds[i]);
        }
    }

    return failed;
}