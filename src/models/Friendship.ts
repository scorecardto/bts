import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

class Friendship extends Model<
  InferAttributes<Friendship>,
  InferCreationAttributes<Friendship>
> {
  declare id: CreationOptional<number>;
  declare from_uid: string;
  declare to_uid: string;
  declare blocked: boolean;
}

function initializeFriendshipModel(sequelize: Sequelize) {
  Friendship.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      from_uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      to_uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      blocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    { sequelize, tableName: "friendships", modelName: "Friendship" }
  );
}

export { Friendship, initializeFriendshipModel };
