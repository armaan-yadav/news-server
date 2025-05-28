import { formidable } from "formidable";
import moment from "moment";
import mongoose from "mongoose";
import { nodeCache } from "../../server.js";
import galleryModel from "../models/gallery.models.js";
import newsModel from "../models/news.models.js";
import categoryModel from "../models/category.models.js";

const { ObjectId } = mongoose.mongo;

class NewsController {
  add_news = async (req, res) => {
    console.log("add news called");
    const { id, name } = req.userInfo;
    const form = formidable({});

    try {
      const [fields] = await form.parse(req);
      const { title, description, subTitle, category, image } = fields;
      const news = await newsModel.create({
        writerId: id,
        title: title[0].trim(),
        slug: title[0].trim().split(" ").join("-"),
        subTitle: subTitle[0].trim(),
        category: category[0].trim(),
        description: description[0],
        date: moment().format("LL"),
        writerName: name,
        image: image[0].trim(),
      });
      nodeCache.del("categories_with_news_count");
      nodeCache.del("category_names");
      console.log(news);
      return res.status(201).json({ message: "news add success", news });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  update_news = async (req, res) => {
    const { news_id } = req.params;
    const form = formidable({});

    try {
      const [fields] = await form.parse(req);
      const { title, description, subTitle, category, image } = fields;

      const news = await newsModel.findByIdAndUpdate(
        news_id,
        {
          title: title[0].trim(),
          slug: title[0].trim().split(" ").join("-"),
          description: description[0],
          image: image[0].trim(),
          subTitle: subTitle[0].trim(),
          category: category[0].trim(),
        },
        { new: true }
      );
      nodeCache.del("news");
      nodeCache.del("categories_with_news_count");
      nodeCache.del("category_names");
      return res.status(200).json({ message: "news update success", news });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  update_news_update = async (req, res) => {
    const { role } = req.userInfo;
    const { news_id } = req.params;
    const { status } = req.body;

    if (role === "admin") {
      const news = await newsModel.findByIdAndUpdate(
        news_id,
        { status },
        { new: true }
      );
      nodeCache.del("news");
      return res
        .status(200)
        .json({ message: "news status update success", news });
    } else {
      return res.status(401).json({ message: "You cannot access this api" });
    }
  };
  get_images = async (req, res) => {
    const { id } = req.userInfo;

    try {
      const images = await galleryModel
        .find({ writerId: new ObjectId(id) })
        .sort({ createdAt: -1 });
      return res.status(201).json({ images });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_recent_news = async (req, res) => {
    try {
      const news = await newsModel
        .find({ status: "active" })
        .sort({ createdAt: -1 })
        .skip(6)
        .limit(6);
      return res.status(201).json({ news });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_category_news = async (req, res) => {
    const { category } = req.params;

    try {
      const news = await newsModel.find({
        $and: [
          {
            category: {
              $eq: category,
            },
          },
          {
            status: {
              $eq: "active",
            },
          },
        ],
      });
      return res.status(201).json({ news });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  news_search = async (req, res) => {
    const { value } = req.query;
    try {
      const news = await newsModel.find({
        status: "active",
        $text: {
          $search: value,
        },
      });
      return res.status(201).json({ news });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_dashboard_news = async (req, res) => {
    console.log("first");
    if (nodeCache.has("news")) {
      const news = nodeCache.get("news");
      return res.status(200).json({ news });
    }
    try {
      const news = await newsModel.find({}).sort({ createdAt: -1 });
      nodeCache.set("news", news);
      return res.status(200).json({ news });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_paginated_news = async (req, res) => {
    console.log("Fetching dashboard news with pagination");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";
    const writerId = req.query.writerId || "";

    const cacheKey = `news_page_${page}_limit_${limit}_search_${search}_status_${status}_writerId_${writerId}`;

    if (nodeCache.has(cacheKey)) {
      const cachedData = nodeCache.get(cacheKey);
      return res.status(200).json(cachedData);
    }

    try {
      let query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      if (status && status !== "all") {
        query.status = status;
      }

      if (writerId) {
        query.writerId = writerId;
      }

      const totalNews = await newsModel.countDocuments(query);

      const news = await newsModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .populate("category")
        .populate("writerId", "name email"); // Populating writer details

      const totalPages = Math.ceil(totalNews / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const responseData = {
        news,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalNews,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null,
        },
        filters: {
          search,
          status,
          writerId,
        },
      };

      const cacheTime = search || status || writerId ? 180 : 300;
      // nodeCache.set(cacheKey, responseData, cacheTime);

      return res.status(200).json(responseData);
    } catch (error) {
      console.log("Error fetching news:", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  get_news_stats = async (req, res) => {
    const cacheKey = "news_stats";

    if (nodeCache.has(cacheKey)) {
      const cachedStats = nodeCache.get(cacheKey);
      return res.status(200).json(cachedStats);
    }

    try {
      const stats = await newsModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const totalStats = await newsModel.countDocuments();

      const formattedStats = {
        total: totalStats,
        byStatus: stats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };

      // Cache stats for 10 minutes
      nodeCache.set(cacheKey, formattedStats, 600);

      return res.status(200).json(formattedStats);
    } catch (error) {
      console.log("Error fetching news stats:", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_dashboard_single_news = async (req, res) => {
    const { news_id } = req.params;
    try {
      const news = await newsModel
        .findById(news_id)
        .populate("category", "name");
      return res.status(200).json({ news });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  delete_news = async (req, res) => {
    try {
      const { news_id } = req.params;
      await newsModel.findByIdAndDelete(news_id);
      return res.status(200).json({ message: "News deleted successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  // website
  get_all_news = async (req, res) => {
    try {
      const category_news = await newsModel.aggregate([
        {
          $sort: { createdAt: -1 },
        },
        {
          $match: {
            status: "active",
          },
        },
        {
          $group: {
            _id: "$category",
            news: {
              $push: {
                _id: "$_id",
                title: "$title",
                slug: "$slug",
                writerName: "$writerName",
                image: "$image",
                description: "$description",
                date: "$date",
                category: "$category",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            news: {
              $slice: ["$news", 5],
            },
          },
        },
      ]);

      const news = {};
      for (let i = 0; i < category_news.length; i++) {
        news[category_news[i].category] = category_news[i].news;
      }
      return res.status(200).json({ news });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_news = async (req, res) => {
    const { slug } = req.params;

    try {
      const news = await newsModel.findOneAndUpdate(
        { slug },
        {
          $inc: { count: 1 },
        },
        { new: true }
      );

      const relateNews = await newsModel
        .find({
          $and: [
            {
              slug: {
                $ne: slug,
              },
            },
            {
              category: {
                $eq: news.category,
              },
            },
          ],
        })
        .limit(4)
        .sort({ createdAt: -1 });

      return res.status(200).json({ news: news ? news : {}, relateNews });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_popular_news = async (req, res) => {
    console.log("asdsa");
    try {
      const popularNews = await newsModel
        .find({ status: "active" })
        .sort({ count: -1 })
        .limit(4);
      return res.status(200).json({ popularNews });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_latest_news = async (req, res) => {
    try {
      const news = await newsModel
        .find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(6);

      return res.status(200).json({ news });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  get_images = async (req, res) => {
    try {
      const images = await newsModel.aggregate([
        {
          $match: {
            status: "active",
          },
        },
        {
          $sample: {
            size: 9,
          },
        },
        {
          $project: {
            image: 1,
          },
        },
      ]);
      console.log(images);
      return res.status(200).json({ images });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
const NewsControllers = new NewsController();
export default NewsControllers;
