import moment from "moment";
import { Connection, Document, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

const MODEL_NAME = "Month";

interface DaySummary {
  /** Day of month */
  day: number;
  /** Total value of all transactions of the day */
  value: number;
}

export interface Month extends Document {
  /** Month ID */
  _id: number;
  /** Year */
  year: number;
  /** Month */
  month: number;
  /** Month start date */
  dateFrom: Date;
  /** Month end date */
  dateTo: Date;
  /** Opening balance in cent */
  openingBalance: number;
  /** Monetary value in cent */
  closingBalance: number;
  /** Total value of all transactions of the month */
  value: number;
  /** Days */
  days: DaySummary[];
}

export async function initModel(connection: Connection) {
  const MainSchema = new Schema<Month>(
    {
      year: {
        type: Number,
        required: true,
        min: 1900,
        max: 2199
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
          const noOfDays = moment().set({ year: this.year, month: this.month - 1 }).daysInMonth();
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

  connection.model(MODEL_NAME, MainSchema);
}