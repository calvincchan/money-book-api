import { Transaction } from "@/models/Transaction";
import moment from "moment";
import { Connection, Document, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

const MODEL_NAME = "Month";

const MIN_YEAR = 1900;
const MAX_YEAR = 2199;

interface DaySummary {
  /** Day of month */
  day: number;
  /** Total value of all transactions of the day */
  value: number;
}

export interface Month extends Document {
  /** Month ID */
  _id: number;
  /** Year: 1900 - 2199 */
  year: number;
  /** Month: 1-12 */
  month: number;
  /** Month start date. Auto derived from year-month. */
  dateFrom: Date;
  /** Month end date. Auto derived from year-month. */
  dateTo: Date;
  /** Opening balance in cent */
  openingBalance: number;
  /** Monetary value in cent */
  closingBalance: number;
  /** Total value of all transactions of the month */
  value: number;
  /** Days */
  days: DaySummary[];
  /** Instance method: recalulate */
  recalculate: (triggerDate: Date) => Promise<void>;
}

export async function initModel(connection: Connection) {
  const MainSchema = new Schema<Month>(
    {
      year: {
        type: Number,
        required: true,
        min: MIN_YEAR,
        max: MAX_YEAR
      },
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      dateFrom: {
        type: Date,
        default: function () {
          return moment().set({ year: this.year, month: this.month - 1 }).startOf("month").toDate();
        },
      },
      dateTo: {
        type: Date,
        default: function () {
          return moment().set({ year: this.year, month: this.month - 1 }).endOf("month").toDate();
        },
      },
      openingBalance: {
        type: Number,
        default: 0,
      },
      closingBalance: {
        type: Number,
        default: 0,
      },
      value: {
        type: Number,
        default: 0,
      },
      days: {
        type: [{ type: Object }],
        default: function () {
          const noOfDays = moment().set({ year: this.year, month: this.month - 1 }).startOf("month").daysInMonth();
          const result: DaySummary[] = [];
          for (let i = 1; i <= noOfDays; i++) {
            result.push({ day: i, value: 0 });
          }
          return result;
        }
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
    startAt: 100,
  });

  /** Recalculate values. */
  MainSchema.method("recalculate", async function (triggerDate: Date) {
    const Transaction = connection.model<Transaction>("Transaction");

    /** Find all transactions of the month, and calculate value, closingBalance */
    const monthTransactions = await Transaction.find({transactionDate: {$gte: this.dateFrom, $lte: this.dateTo}}).sort("transactionDate");
    this.value = monthTransactions.reduce((sum, x) => sum + x.value, 0);
    this.closingBalance = this.openingBalance + this.value;

    /** Update daily total. */
    const triggerDateString = moment(triggerDate).format("YYYY-MM-DD");
    const dayTransactions = monthTransactions.filter(x => moment(x.transactionDate).isSame(triggerDateString, "day") );
    const dayValue = dayTransactions.reduce((sum, x) => sum + x.value, 0);
    this.set(`days.${triggerDate.getDate() - 1}.value`, dayValue);

    const result = await this.save();
  });

  connection.model(MODEL_NAME, MainSchema);
}