import authModel from "../models/authModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class authController {
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
    console.log("first");
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
        // const match = password === user.password;
        if (match) {
          const obj = {
            id: user.id,
            name: user.name,
            category: user.category,
            role: user.role,
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
    const { email, name, password, category } = req.body;

    if (!name) {
      return res.status(404).json({ message: "please provide name" });
    }
    if (!password) {
      return res.status(404).json({ message: "please provide password" });
    }
    if (!category) {
      return res.status(404).json({ message: "please provide category" });
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
          category: category.trim(),
          role: "writer",
        });
        return res
          .status(201)
          .json({ message: "writer add success", writer: new_writer });
      }
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  };

  get_writers = async (req, res) => {
    try {
      const writers = await authModel
        .find({ role: "writer" })
        .sort({ createdAt: -1 });
      return res.status(200).json({ writers });
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  };
}
const authControllers = new authController();
export default authControllers;
