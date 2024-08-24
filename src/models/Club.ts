import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { ClubMembership } from "./ClubMembership";

class Club extends Model<InferAttributes<Club>, InferCreationAttributes<Club>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare ticker: string;
  declare school: string;
  declare owner: string;
  declare metadata: string;
}

function initializeClubModel(sequelize: Sequelize) {
  Club.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      school: {
        type: DataTypes.STRING,
        references: {
          model: "schools",
          key: "unique_name",
        },
        allowNull: false,
      },
      owner: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ticker: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { sequelize, tableName: "clubs", modelName: "Club" }
  );
}

// Club.hasMany(ClubMembership, { foreignKey: "club" });
export { initializeClubModel, Club };
