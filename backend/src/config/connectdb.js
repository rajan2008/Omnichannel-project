import mongoose from "mongoose";
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database is connect");
  } catch (error) {
    console.log("Database is not connect");
    console.log(error);
  }
};

export default connect