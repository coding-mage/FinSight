import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import connectDB from './config/db.js';
import cors from 'cors'
import authenticateJWT from './middleware/authMiddleware.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import expenseAIRoutes from './routes/expenseAIRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';
import parseRoutes from './routes/parseRoutes.js';
import statementRoutes from './routes/StatementRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import quizRoutes from './routes/quiz.js';  
import challengeRoutes from './routes/challengeRoutes.js';  
import multer from 'multer';


dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use('/api/ai', expenseAIRoutes);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: 'http://localhost:3000'
  }));

  app.use((req, res, next) => {
    console.log('CORS headers set!');
    next();
  });

app.use(express.json());

app.get('/test', (req, res) => {
    res.send('CORS Test Passed!');
  });


app.use('/api', ocrRoutes);

app.use('/api/quiz', authenticateJWT, quizRoutes);

app.use('/api/challenge', authenticateJWT, challengeRoutes);

// financeRoutes was removed as it duplicated endpoints and wasn't used by the frontend.

app.use('/api/expenses',authenticateJWT, expenseRoutes);
app.use('/api/incomes', authenticateJWT, incomeRoutes);
app.use('/api/expense', parseRoutes);
app.use('/api/news', authenticateJWT, newsRoutes);


app.use('/api/statements',authenticateJWT, statementRoutes);
app.use('/api/simulator',authenticateJWT, simulatorRoutes);


//app.all('(.*)', cors());

// app.use('/api/auth', authRoutes);

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');
//     app.listen(process.env.PORT || 5000, () => {
//       console.log('Server running');
//     });
//   })
//   .catch(err => console.log(err));

connectDB()

// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }).then(() => console.log('MongoDB connected'))
//     .catch(err => console.error(err));
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
