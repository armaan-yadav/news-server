import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authModel from "../models/auth.models.js";
import newsModel from "../models/news.models.js";

class AuthController {
  signup = async (req, res) => {
    const { name, email, password, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Please provide your name" });
    }
    if (!email) {
      return res.status(400).json({ message: "Please provide your email" });
    }
    if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }
    if (!password) {
      return res.status(400).json({ message: "Please provide your password" });
    }
    if (!category) {
      return res.status(400).json({ message: "Please provide your category" });
    }

    try {
      const existingUser = await authModel.findOne({ email: email.trim() });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password.trim(), 10);

      const newUser = await authModel.create({
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        category: category.trim(),
        role: "user", // default role
      });

      return res
        .status(201)
        .json({ message: "Signup successful", user: newUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(404).json({ message: "Please provide your email" });
    }
    if (!password) {
      return res.status(404).json({ message: "Please provide your password" });
    }

    try {
      const user = await authModel.findOne({ email }).select("+password");
      console.log(user);
      if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const obj = {
            id: user.id,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
          };
          const token = await jwt.sign(obj, process.env.secret, {
            expiresIn: "1h",
          });
          return res.status(200).json({ message: "login success", token });
        } else {
          return res.status(404).json({ message: "invalid password" });
        }
      } else {
        return res.status(404).json({ message: "user not found" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  add_writer = async (req, res) => {
    const { email, name, password } = req.body;

    if (!name) {
      return res.status(404).json({ message: "please provide name" });
    }
    if (!password) {
      return res.status(404).json({ message: "please provide password" });
    }
    if (!email) {
      return res.status(404).json({ message: "please provide email" });
    }
    if (email && !email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      return res.status(404).json({ message: "please provide valide email" });
    }
    try {
      const writer = await authModel.findOne({ email: email.trim() });
      if (writer) {
        return res.status(404).json({ message: "User alreasy exit" });
      } else {
        const new_writer = await authModel.create({
          name: name.trim(),
          email: email.trim(),
          password: await bcrypt.hash(password.trim(), 10),
          role: "writer",
        });
        return res
          .status(201)
          .json({ message: "writer add success", writer: new_writer });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "internal server error" });
    }
  };

  get_writers = async (req, res) => {
    try {
      const writers = await authModel.find().sort({ createdAt: -1 });
      return res.status(200).json({ writers });
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  };
  get_writer_by_id = async (req, res) => {
    console.log("get_writer_by_id called");
    const { writer_id } = req.params;
    console.log(writer_id);

    if (!writer_id) {
      return res.status(400).json({ message: "Writer ID is required" });
    }

    try {
      const writer = await authModel.findById(writer_id);
      console.log(writer);

      if (!writer) {
        console.log("Writer not found");
        return res.status(404).json({ message: "Writer not found" });
      }

      return res.status(200).json({ writer });
    } catch (error) {
      console.error("Error fetching writer by ID:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  get_writer_news_count = async (req, res) => {
    try {
      const result = await newsModel.aggregate([
        {
          $group: {
            _id: {
              writer_id: "$writer_id",
              writerName: "$writerName",
            },
            activeNewsCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "active"] }, 1, 0],
              },
            },
            inactiveNewsCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "inactive"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            writer_id: "$_id.writer_id",
            writerName: "$_id.writerName",
            activeNewsCount: 1,
            inactiveNewsCount: 1,
          },
        },
        {
          $sort: { activeNewsCount: -1 }, // Optional: sort by active news
        },
      ]);

      return res.status(200).json({ stats: result });
    } catch (error) {
      console.log("error", error);
      // console.error("Error fetching writer news count:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  edit_writer = async (req, res) => {
    const { writer_id } = req.params;
    const { name, password, isActive, role } = req.body;

    if (!writer_id) {
      return res.status(400).json({ message: "Writer ID is required" });
    }

    try {
      const writer = await authModel.findById(writer_id);
      if (!writer) {
        return res.status(404).json({ message: "Writer not found" });
      }

      if (name) writer.name = name.trim();

      if (typeof isActive === "boolean") writer.isActive = isActive;
      if (password) writer.password = await bcrypt.hash(password.trim(), 10);
      if (role) writer.role = role.trim();

      const updatedWriter = await writer.save();

      return res.status(200).json({
        message: "Writer updated successfully",
        writer: updatedWriter,
      });
    } catch (error) {
      console.error("Error updating writer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
const AuthControllers = new AuthController();
export default AuthControllers;
