import mongoose, { Schema, Document } from 'mongoose';
import { NewsArticle } from '../types/news';

interface INewsArticle extends Omit<NewsArticle, 'id'>, Document {}

const newsSchema = new Schema<INewsArticle>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  source: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  publishedAt: { type: Date, required: true },
  category: { type: String },
  author: { type: String },
  imageUrl: { type: String },
  isProcessed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const NewsModel = mongoose.model<INewsArticle>('News', newsSchema);