import Expo from "expo-server-sdk";

export default async function getExpo() {
    return new Expo({
        accessToken: process.env.EXPO_ACCESS_TOKEN,
    });
}