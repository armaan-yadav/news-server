import { formidable } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import newsModel from "../models/news.models.js";
import authModel from "../models/auth.models.js";
import galleryModel from "../models/gallery.models.js";
import mongoose from "mongoose";
import moment from "moment";

const { ObjectId } = mongoose.mongo;

class NewsController {
  add_news = async (req, res) => {
    console.log("add news called");
    const { id, name } = req.userInfo;
    const form = formidable({});

    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      secure: true,
    });

    try {
      const [fields, files] = await form.parse(req);
      const { url } = await cloudinary.uploader.upload(
        files.image[0].filepath,
        { folder: "news-app/thumbails" }
      );
      const { title, description, subTitle, category } = fields;
      const news = await newsModel.create({
        writerId: id,
        title: title[0].trim(),
        slug: title[0].trim().split(" ").join("-"),
        subTitle: subTitle[0].trim(),
        category: category[0].trim(),
        description: description[0],
        date: moment().format("LL"),
        writerName: name,
        image: url,
      });
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

    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      secure: true,
    });

    try {
      const [fields, files] = await form.parse(req);
      const { title, description } = fields;
      let url = fields.old_image[0];

      if (Object.keys(files).length > 0) {
        const spliteImage = url.split("/");
        const imagesFile = spliteImage[spliteImage.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(imagesFile);
        const data = await cloudinary.uploader.upload(
          files.new_image[0].filepath,
          { folder: "news_images" }
        );
        url = data.url;
      }

      const news = await newsModel.findByIdAndUpdate(
        news_id,
        {
          title: title[0].trim(),
          slug: title[0].trim().split(" ").join("-"),
          description: description[0],
          image: url,
        },
        { new: true }
      );

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

  add_image = async (req, res) => {
    console.log("add image called");

    const form = formidable({ multiples: false, keepExtensions: true });

    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      secure: true,
    });

    try {
      const files = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve(files);
        });
      });

      const imageFile = files.images;

      if (!imageFile || !imageFile.filepath) {
        console.log("Invalid file:", imageFile);
        return res
          .status(400)
          .json({ message: "No file provided or invalid file path" });
      }

      const uploadResult = await cloudinary.uploader.upload(
        imageFile.filepath,
        {
          folder: "news-app",
        }
      );

      return res.status(201).json({
        url: uploadResult.secure_url,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  get_dashboard_news = async (req, res) => {
    const { id, role } = req.userInfo;
    try {
      if (role === "admin") {
        const news = await newsModel.find({}).sort({ createdAt: -1 });
        return res.status(200).json({ news });
      } else {
        const news = await newsModel
          .find({ writerId: new ObjectId(id) })
          .sort({ createdAt: -1 });
        return res.status(200).json({ news });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  get_dashboard_single_news = async (req, res) => {
    const { news_id } = req.params;
    try {
      const news = await newsModel.findById(news_id);
      return res.status(200).json({ news });
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
