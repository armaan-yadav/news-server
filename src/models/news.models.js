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
      type: Schema.Types.ObjectId,
      ref: "Category",
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

newsSchema.index({ category: 1, status: 1, createdAt: -1 });

newsSchema.index({ status: 1, createdAt: -1 });
newsSchema.index({ slug: 1 });
newsSchema.index({ writerId: 1 });

newsSchema.index(
  {
    title: "text",
    description: "text",
  },
  {
    weights: {
      title: 5,
      description: 4,
    },
    name: "text_search_index",
  }
);
export default model("news", newsSchema);
