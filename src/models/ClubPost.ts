import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

class ClubPost extends Model<
  InferAttributes<ClubPost>,
  InferCreationAttributes<ClubPost>
> {
  declare id: CreationOptional<number>;
  declare club: number;
  declare content: string;
  declare promotion_option: string;
  declare event_date?: Date;
  declare picture?: string;
  declare link?: string;
}

function initializeClubPostModel(sequelize: Sequelize) {
  ClubPost.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      club: {
        type: DataTypes.INTEGER,
        references: {
          model: "clubs",
          key: "id",
        },
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      promotion_option: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      event_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    { sequelize, tableName: "club_posts", modelName: "ClubPost" }
  );
}

// Club.hasMany(ClubMembership, { foreignKey: "club" });
export { initializeClubPostModel, ClubPost };
