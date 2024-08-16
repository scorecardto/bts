import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

class Club extends Model<InferAttributes<Club>, InferCreationAttributes<Club>> {
  declare id: CreationOptional<number>;
  declare name: string;
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
          key: "name",
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
      metadata: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { sequelize, tableName: "clubs", modelName: "Clubs" }
  );
}

export { initializeClubModel, Club };
