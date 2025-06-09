const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongo');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
// Only connect to DB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

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

// module.exports = app;

// Only start the server if this file is run directly
// if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
// }


