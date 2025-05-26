import mongoose from "mongoose";

const db_connect = async () => {
  try {
    if (process.env.mode === "production") {
      await mongoose.connect(process.env.db_production_url);
      console.log("production database connected");
    } else {
      console.log("ok");
      await mongoose.connect(process.env.db_local_url);
      console.log("local database connected");
    }
  } catch (error) {
    console.error(error);
  }
};

export default db_connect;
