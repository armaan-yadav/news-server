import newsModels from "../models/news.models.js";

class CategoriesControllers {
  get_categories = async (req, res) => {
    try {
      const categories = await newsModel.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            count: 1,
          },
        },
      ]);
      return res.status(200).json({ categories });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getAllCategoryNames = async (req, res) => {
    try {
      const categoriesRaw = await newsModels.aggregate([
        { $group: { _id: "$category" } },
      ]);

      const categories = categoriesRaw.map((item) => item._id);

      return res.status(200).json({ categories });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

const categoriesControllers = new CategoriesControllers();
export default categoriesControllers;
