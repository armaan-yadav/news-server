import { model, Schema } from "mongoose";

const newsSchema = new Schema(
  {
    writerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "authors",
    },
    writerName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

newsSchema.index(
  {
    title: "text",
    category: "text",
    description: "text",
  },
  {
    title: 5,
    description: 4,
    category: 2,
  }
);

export default model("news", newsSchema);
