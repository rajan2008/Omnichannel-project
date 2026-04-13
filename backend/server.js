import express from "express";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import connect from "./src/config/connectdb.js";
dotenv.config();
const app = express();

app.use(express.json());


app.use("/api/auth", authRoutes);

//Dummy
app.get("/api", (req, res) => {
  res.send("API is running");
});

const startServr = async () => {
  try {
    await connect();
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  } catch (error) {
    console.log("Server failed to start");
    process.exit(1);
  }
}

startServr()