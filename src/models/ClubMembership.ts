import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { Club } from "./Club";

class ClubMembership extends Model<
  InferAttributes<ClubMembership>,
  InferCreationAttributes<ClubMembership>
> {
  declare id: CreationOptional<number>;
  declare phone_number: string;
  declare email: CreationOptional<string>;
  declare club: number;
  declare first_name: CreationOptional<string>;
  declare last_name: CreationOptional<string>;
  declare manager: CreationOptional<boolean>;
}

function initializeClubMembershipModel(sequelize: Sequelize) {
  ClubMembership.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
      },
      club: {
        type: DataTypes.INTEGER,
        references: {
          model: "clubs",
          key: "id",
        },
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      manager: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { sequelize, tableName: "club_memberships", modelName: "ClubMembership" }
  );
}
// ClubMembership.belongsTo(Club, { foreignKey: "club" });

export { initializeClubMembershipModel, ClubMembership };
