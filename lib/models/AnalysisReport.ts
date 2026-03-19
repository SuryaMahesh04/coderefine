import mongoose from "mongoose";

const BugSchema = new mongoose.Schema({
  category: { type: String, required: true },
  severity: { type: String, enum: ["critical", "medium", "low", "info"], required: true },
  message: { type: String, required: true },
  line: { type: Number },
  filename: { type: String }
});

const EditSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalCode: { type: String, required: true },
  rewrittenCode: { type: String, required: true }
});

const AnalysisReportSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: false }, // Optional in case of ad-hoc scans
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scores: {
    security: { type: Number, required: true },
    performance: { type: Number, required: true },
    quality: { type: Number, required: true },
    overallRating: { type: Number, required: true },
    codeDetected: { type: Boolean, default: true }
  },
  bugs: [BugSchema],
  filesAnalyzed: [{ type: String }],
  appliedEdits: [EditSchema],
  timestamp: { type: Date, default: Date.now }
});

export const AnalysisReport = mongoose.models.AnalysisReport || mongoose.model("AnalysisReport", AnalysisReportSchema);
