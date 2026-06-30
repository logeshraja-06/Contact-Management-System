import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoutes from './routes/contactRoutes.js'

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/contacts', contactRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('MongoDB connected');
    app.listen(5000, ()=>console.log('Server running on port 5000'))
})
.catch((err)=>console.log(err));