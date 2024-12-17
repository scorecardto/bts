import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

class TextTransaction extends Model<
  InferAttributes<TextTransaction>,
  InferCreationAttributes<TextTransaction>
> {
  declare id: CreationOptional<number>;
  declare phone_number: string;
  declare message: string;
}

function initializeTextTransactionModel(sequelize: Sequelize) {
  TextTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      phone_number: {
        type: DataTypes.STRING,
      },
      message: {
        type: DataTypes.STRING,
      },
    },
    { sequelize, tableName: "text_transactions", modelName: "TextTransaction" }
  );
}

export { TextTransaction, initializeTextTransactionModel };
