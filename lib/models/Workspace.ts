import mongoose from "mongoose";

const FileNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["file", "folder"], required: true },
  content: { type: String },
  language: { type: String },
  isExpanded: { type: Boolean }
});

// Since FileNode is recursive, we need to add the children field after definition
FileNodeSchema.add({
  children: [FileNodeSchema]
});

const WorkspaceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  files: [FileNodeSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WorkspaceSchema.pre("save", function() {
  (this as any).updatedAt = new Date();
});

export const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);
