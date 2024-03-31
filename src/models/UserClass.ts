import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

class UserClass extends Model<
  InferAttributes<UserClass>,
  InferCreationAttributes<UserClass>
> {
  declare id: CreationOptional<number>;
  declare user: string;
  declare course_key?: string;
  declare period?: string;
  declare room_number?: string;
}

function initializeUserClassModel(sequelize: Sequelize) {
  UserClass.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      course_key: {
        type: DataTypes.STRING,
      },
      period: {
        type: DataTypes.STRING,
      },
      room_number: {
        type: DataTypes.STRING,
      },
    },
    { sequelize, tableName: "user_classes", modelName: "UserClass" }
  );
}

export { initializeUserClassModel, UserClass };
