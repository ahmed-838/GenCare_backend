const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongo');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
connectDB();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send('Backend is running'));
app.use('/api/signup', require('./routes/signup'));
app.use('/api/login', require('./routes/login'));
app.use('/api/personalInfo', require('./routes/profileinfo'));
app.use('/api/healthInfo', require('./routes/health_info'));
app.use('/api/savedDiseases', require('./routes/saved_diseases'));
app.use('/api/savedWeeks', require('./routes/savedWeeks'));
app.use('/api/savedBabyNames', require('./routes/saved_baby_names'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai-diagnosis', require('./routes/ai-diagnosis'));

module.exports = app

// const port = process.env.PORT;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });


