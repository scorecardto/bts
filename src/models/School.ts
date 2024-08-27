import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

class School extends Model<
  InferAttributes<School>,
  InferCreationAttributes<School>
> {
  declare unique_name: string;
  declare name: string;
  declare district_host: string;
  declare verified: boolean;
  declare min_grade?: number;
  declare max_grade?: number;
  declare display_name?: string;
  declare short_code?: string;
  declare special_domain?: string;
}

function initializeSchoolModel(sequelize: Sequelize) {
  School.init(
    {
      unique_name: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district_host: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      min_grade: {
        type: DataTypes.INTEGER,
      },
      max_grade: {
        type: DataTypes.INTEGER,
      },
      display_name: {
        type: DataTypes.STRING,
      },
      short_code: {
        type: DataTypes.STRING,
      },
      special_domain: {
        type: DataTypes.STRING,
      },
    },
    { sequelize, tableName: "schools", modelName: "School" }
  );
}

export { initializeSchoolModel, School };
