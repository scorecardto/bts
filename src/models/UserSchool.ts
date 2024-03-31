import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

class UserSchool extends Model<
  InferAttributes<UserSchool>,
  InferCreationAttributes<UserSchool>
> {
  declare uid: string;
  declare first_name?: string;
  declare last_name?: string;
  declare real_first_name?: string;
  declare real_last_name?: string;
  declare np_grade_level?: string;
  declare school: string;
}

function initializeUserSchoolModel(sequelize: Sequelize) {
  UserSchool.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      school: {
        type: DataTypes.STRING,
        references: {
          model: "schools",
          key: "name",
        },
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      real_first_name: {
        type: DataTypes.STRING,
      },
      real_last_name: {
        type: DataTypes.STRING,
      },
      np_grade_level: {
        type: DataTypes.STRING,
      },
    },
    { sequelize, tableName: "user_schools", modelName: "UserSchool" }
  );
}

export { initializeUserSchoolModel, UserSchool };
