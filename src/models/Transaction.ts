import { Connection, Document, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

const MODEL_NAME = "Transaction";

export interface Transaction extends Document {
  _id: number;
  /** Monetary value in cent. */
  value: number;
  /** Transaction text label. */
  label: string;
  /** Transaction confirmed? */
  confirmed: Boolean;
  /** Category */
  category: number;
  /** Transaction date. */
  transactionDate: Date,
  /** Custom description. */
  description: string;
}

export async function initModel(connection: Connection) {
  const MainSchema = new Schema<Transaction>(
    {
      value: {
        type: Number,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
      confirmed: {
        type: Boolean,
        default: false
      },
      category: {
        type: Number,
        ref: "Category",
      },
      transactionDate: {
        type: Date,
        required: true
      },
      description: {
        type: String,
        default: ""
      }
    },
    {
      id: false,
      timestamps: true,
    }
  );

  /** Add autoinc _id */
  MainSchema.plugin(autoIncrement, {
    model: MODEL_NAME,
    startAt: 1000,
  });


  connection.model(MODEL_NAME, MainSchema);
}