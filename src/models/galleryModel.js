import { model, Schema } from "mongoose";

const galler_schema = new Schema(
  {
    writerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "authors",
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("images", galler_schema);
