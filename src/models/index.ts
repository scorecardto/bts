import exp from "constants";
import { Sequelize } from "sequelize";
import { initializeUserSchoolModel } from "./UserSchool";
import { initializeUserClassModel } from "./UserClass";
import { initializeSchoolModel } from "./School";
import { initializeFriendRequestModel } from "./FriendRequest";
import { initializeFriendshipModel } from "./Friendship";

export default function initializeModel() {
  const {
    MYSQL_DATABASE_NAME,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
    MYSQL_HOST,
  } = process.env;

  const sequelize = new Sequelize(
    MYSQL_DATABASE_NAME!,
    MYSQL_USERNAME!,
    MYSQL_PASSWORD,
    {
      host: MYSQL_HOST,
      port: parseInt(MYSQL_PORT!),
      dialect: "mysql",
    }
  );

  initializeSchoolModel(sequelize);
  initializeUserSchoolModel(sequelize);
  initializeUserClassModel(sequelize);
  initializeFriendRequestModel(sequelize);
  initializeFriendshipModel(sequelize);

  return sequelize;
}
