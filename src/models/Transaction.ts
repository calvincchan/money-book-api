import { Month } from "@/models/Month";
import { Connection, Document, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

const MODEL_NAME = "Transaction";

export interface Transaction extends Document {
  /** Transaction ID */
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
  /** Book ID */
  book: number;
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
        default: "",
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
        default: () => new Date()
      },
      description: {
        type: String,
        default: ""
      },
      book: {
        type: Number
      }
    },
    {
      id: false,
      timestamps: true,
    }
  );

  MainSchema.post("save", async function () {
    const Month = connection.model<Month>("Month");
    const yearNumber = this.transactionDate.getFullYear();
    const monthNumber = this.transactionDate.getMonth() + 1;
    let month = await Month.findOne({year: yearNumber, month: monthNumber});
    if (!month) {
      month = await Month.create({year: yearNumber, month: monthNumber});
    }
    await month.recalculate(this.transactionDate);
  });

  MainSchema.post("remove", async function () {
    const Month = connection.model<Month>("Month");
    const yearNumber = this.transactionDate.getFullYear();
    const monthNumber = this.transactionDate.getMonth() + 1;
    let month = await Month.findOne({year: yearNumber, month: monthNumber});
    if (!month) {
      month = await Month.create({year: yearNumber, month: monthNumber});
    }
    await month.recalculate(this.transactionDate);
  });

  /** Add autoinc _id */
  MainSchema.plugin(autoIncrement, {
    model: MODEL_NAME,
    startAt: 1000,
  });

  connection.model(MODEL_NAME, MainSchema);
}