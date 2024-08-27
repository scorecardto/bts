import exp from "constants";
import { Sequelize } from "sequelize";
import { initializeUserSchoolModel, UserSchool } from "./UserSchool";
import { initializeUserClassModel } from "./UserClass";
import { initializeSchoolModel, School } from "./School";
import { initializeFriendRequestModel } from "./FriendRequest";
import { initializeFriendshipModel } from "./Friendship";
import { Club, initializeClubModel } from "./Club";
import {
  ClubMembership,
  initializeClubMembershipModel,
} from "./ClubMembership";
import { ClubPost, initializeClubPostModel } from "./ClubPost";

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

  initializeClubModel(sequelize);
  initializeClubMembershipModel(sequelize);
  ClubMembership.belongsTo(Club);
  Club.hasMany(ClubMembership);

  initializeClubPostModel(sequelize);
  ClubPost.belongsTo(Club);
  Club.hasMany(ClubPost);

  Club.belongsTo(UserSchool, { foreignKey: "owner", targetKey: "uid" });
  UserSchool.hasMany(Club, { foreignKey: "owner", sourceKey: "uid" });

  Club.belongsTo(School, { foreignKey: "school", targetKey: "unique_name" });
  School.hasMany(Club, { foreignKey: "school", sourceKey: "unique_name" });

  return sequelize;
}
