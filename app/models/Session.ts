// app/models/Session.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionType: "code" | "math";
  codeLanguage?: string;
  tutorVersion: "baseline" | "strategy" | "adaptive";
  startTime: Date;
  endTime?: Date;
  messages: {
    role: "human" | "ai";
    content: string;
    timestamp: Date;
  }[];
  assessment?: any;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionType: {
      type: String,
      enum: ["code", "math"],
      required: true,
    },
    codeLanguage: {
      type: String,
    },
    // Which tutor version ran this session (see app/lib/tutorStrategy.ts)
    tutorVersion: {
      type: String,
      enum: ["baseline", "strategy", "adaptive"],
      default: "baseline",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["human", "ai"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Result of scoring the finished session (see app/lib/scoring.ts)
    assessment: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
