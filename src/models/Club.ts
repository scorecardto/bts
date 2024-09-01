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
  declare school: string;
  declare owner: string;
  declare metadata: string;
  declare club_code: string;
  declare internal_code: CreationOptional<string>;
}

function generateShortCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortCode = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shortCode += characters[randomIndex];
  }
  return shortCode;
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
      club_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      internal_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        defaultValue: "",
      },
      metadata: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { sequelize, tableName: "clubs", modelName: "Club" }
  );

  Club.beforeCreate(async (instance) => {
    console.log(instance);
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateShortCode();
      const existing = await Club.findOne({ where: { internal_code: code } });
      if (!existing) {
        isUnique = true;
      }
    }

    console.log(code);

    instance.internal_code = code!;
  });
}

// Club.hasMany(ClubMembership, { foreignKey: "club" });
export { initializeClubModel, Club };
