import { ICategory } from "./category";
import { ITags } from "./tags";

export interface IBlogs {
  id: number;
  title: string;
  content: string;
  slug: string;
  thumbnail: string;
  metaDescription: string;
  likeCount: number;
  views: number;
  readTime: number;
  categories: ICategory[];
  tags: ITags[];
  createdAt: string;
}

export interface ITrendingBlog {
  id: number;
  createdAt: Date;
  title: string;
  thumbnail: string | null;
  readTime: number | null;
  slug: string;
}
