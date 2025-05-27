import slugify from "slugify";
import { nodeCache } from "../../server.js";
import newsModels from "../models/news.models.js";
import categoryModel from "../models/category.models.js";

class CategoriesControllers {
  get_categories_with_stats = async (req, res) => {
    const cacheKey = "categories_with_news_count";

    if (nodeCache.has(cacheKey)) {
      const categories = nodeCache.get(cacheKey);
      console.log("cached categories");
      return res.status(200).json({ categories });
    }

    try {
      const categories = await newsModels.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        {
          $unwind: "$categoryInfo",
        },
        {
          $project: {
            _id: 0,
            categoryId: "$_id",
            count: 1,
            name: "$categoryInfo.name",
            slug: "$categoryInfo.slug",
          },
        },
      ]);

      nodeCache.set(cacheKey, categories);
      return res.status(200).json({ categories });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getAllCategoryNames = async (req, res) => {
    const cacheKey = "category_names";

    if (nodeCache.has(cacheKey)) {
      console.log("cached categories");
      const categories = nodeCache.get(cacheKey);
      return res.status(200).json({ categories });
    }

    try {
      const categories = await categoryModel
        .find({}, "name slug")
        .sort({ name: 1 });

      nodeCache.set(cacheKey, categories);
      return res.status(200).json({ categories });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  add_category = async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name and slug are required" });
    }
    const slug = slugify(name);

    try {
      const newCategory = await categoryModel.create({ name, slug });
      nodeCache.del("categories_with_news_count");
      nodeCache.del("category_names");

      return res.status(201).json({ category: newCategory });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  delete_category = async (req, res) => {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    try {
      const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);
      if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      nodeCache.del("categories_with_news_count");
      nodeCache.del("category_names");
      return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

const categoriesControllers = new CategoriesControllers();
export default categoriesControllers;
