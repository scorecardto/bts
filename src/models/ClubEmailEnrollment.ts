import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { Club } from "./Club";

class ClubEmailEnrollment extends Model<
  InferAttributes<ClubEmailEnrollment>,
  InferCreationAttributes<ClubEmailEnrollment>
> {
  declare id: CreationOptional<number>;
  declare club: number;
  declare email: string;
  declare first_name: CreationOptional<string>;
  declare last_name: CreationOptional<string>;
}

function initializeClubEmailEnrollmentModel(sequelize: Sequelize) {
  ClubEmailEnrollment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
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
    },
    {
      sequelize,
      tableName: "club_email_enrollments",
      modelName: "ClubEmailEnrollment",
    }
  );
}
// ClubMembership.belongsTo(Club, { foreignKey: "club" });

export { initializeClubEmailEnrollmentModel, ClubEmailEnrollment };
