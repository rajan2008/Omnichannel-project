import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// ENV Setup
dotenv.config();

// Express Init
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Infotact Omnichannel Server is running');
});

// Port Setup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
