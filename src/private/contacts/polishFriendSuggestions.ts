import ContactNode from "../../types/ContactNode";
import getUsers from "../auth/getUsers";
import gender from "gender-detection-ts";
import getPopularity from "./getPopularity";

export default async function polishFriendSuggestions(
  rawSuggestions: ContactNode[],
  userPhoneNumber: string
) {
  console.log(rawSuggestions);

  const removeMe = rawSuggestions.findIndex((suggestion) => {
    const remove = suggestion.phoneNumber === userPhoneNumber;
    console.log(remove, userPhoneNumber);
    return remove;
  });
  if (removeMe !== -1) {
    rawSuggestions.splice(removeMe, 1);
  }

  console.log(rawSuggestions);
  const users = await getUsers();

  const male_onApp: ContactNode[] = [];
  const female_onApp: ContactNode[] = [];
  const male_offApp: ContactNode[] = [];
  const female_offApp: ContactNode[] = [];

  const MALE_WEIGHT = 0.4;
  const FEMALE_WEIGHT = 0.6;
  const ON_APP_WEIGHT = 0.4;
  const OFF_APP_WEIGHT = 0.6;

  const MAX_SUGGESTIONS = Math.min(50, rawSuggestions.length);
  const suggestions = rawSuggestions.slice(0, MAX_SUGGESTIONS);

  users.forEach((user) => {
    const suggestion = suggestions.find(
      (suggestion) => suggestion.phoneNumber === user.phoneNumber
    );

    if (suggestion) {
      suggestion.uid = user.uid;
      suggestion.hasAccount = true;
    }
  });

  suggestions.forEach((suggestion) => {
    const genderGuess = gender.detect(suggestion.name || "", {
      useProbability: true,
    });

    if (suggestion.hasAccount) {
      if (genderGuess === "male") {
        male_onApp.push(suggestion);
      } else {
        female_onApp.push(suggestion);
      }
    } else {
      if (genderGuess === "male") {
        male_offApp.push(suggestion);
      } else {
        female_offApp.push(suggestion);
      }
    }
  });

  const finalSuggestions: ContactNode[] = [];

  while (finalSuggestions.length < MAX_SUGGESTIONS) {
    const willBeMale =
      Math.random() * (MALE_WEIGHT + FEMALE_WEIGHT) < MALE_WEIGHT;

    const willBeOnApp =
      Math.random() * (ON_APP_WEIGHT + OFF_APP_WEIGHT) < ON_APP_WEIGHT;

    if (willBeMale && willBeOnApp && male_onApp.length > 0) {
      finalSuggestions.push(male_onApp.shift()!);
    } else if (!willBeMale && willBeOnApp && female_onApp.length > 0) {
      finalSuggestions.push(female_onApp.shift()!);
    } else if (willBeMale && !willBeOnApp && male_offApp.length > 0) {
      finalSuggestions.push(male_offApp.shift()!);
    } else if (!willBeMale && !willBeOnApp && female_offApp.length > 0) {
      finalSuggestions.push(female_offApp.shift()!);
    }
  }

  const popularity = await getPopularity();
  return finalSuggestions.map((suggestion): ContactNode => {
    return {
      name:
        suggestion.name +
        (suggestion.hasAccount ? "🥳" : "😡") +
        gender.detect(suggestion.name || "", { useProbability: true }),
      phoneNumber: suggestion.phoneNumber,
    };
  });
}
