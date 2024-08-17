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
  declare name?: string;
  declare teacher?: string;
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
      name: {
        type: DataTypes.STRING,
      },
      teacher: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: "user_classes",
      modelName: "UserClass",
      paranoid: true,
    }
  );
}

export { initializeUserClassModel, UserClass };
