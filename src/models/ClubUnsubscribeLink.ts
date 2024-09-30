import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { ClubMembership } from "./ClubMembership";

class ClubUnsubscribeLink extends Model<
  InferAttributes<ClubUnsubscribeLink>,
  InferCreationAttributes<ClubUnsubscribeLink>
> {
  declare id: CreationOptional<number>;
  declare code: CreationOptional<string>;
  declare email: string;
  declare post: number;
}

function initializeClubUnsubscribeLinkModel(sequelize: Sequelize) {
  ClubUnsubscribeLink.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        defaultValue: "",
      },
      email: {
        type: DataTypes.STRING,
      },
      post: {
        type: DataTypes.INTEGER,
        references: {
          model: "club_posts",
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "club_unsubscribe_links",
      modelName: "ClubUnsubscribeLink",
    }
  );
}

export { initializeClubUnsubscribeLinkModel, ClubUnsubscribeLink };
