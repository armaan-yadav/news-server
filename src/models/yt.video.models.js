import { model, Schema } from "mongoose";

const ytSchema = new Schema(
  {
    videoId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("ytVideo", ytSchema);
