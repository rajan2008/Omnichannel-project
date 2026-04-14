import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connect from "./src/config/connectdb.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Infotact Omnichannel Server is running');
});

// Port Setup
const PORT = process.env.PORT || 5000;

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
};

startServr()
