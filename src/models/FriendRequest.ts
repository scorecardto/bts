import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

class FriendRequest extends Model<
  InferAttributes<FriendRequest>,
  InferCreationAttributes<FriendRequest>
> {
  declare id: CreationOptional<number>;
  declare from_uid: string;
  declare to_uid?: string;
  declare to_phone_number?: string;
  declare active: boolean;
}

function initializeFriendRequestModel(sequelize: Sequelize) {
  FriendRequest.init(
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
      },
      to_phone_number: {
        type: DataTypes.STRING,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    { sequelize, tableName: "friend_requests", modelName: "FriendRequests" }
  );
}

export { FriendRequest, initializeFriendRequestModel };
