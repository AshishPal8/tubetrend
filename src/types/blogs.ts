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

export interface IFeaturedBlogs {
  id: number;
  createdAt: Date;
  title: string;
  thumbnail: string | null;
  readTime: number | null;
  slug: string;
  content: string;
  metaDescription: string;
  categories: {
    id: number;
    name: string;
  }[];
}

export interface IBlogCard {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  metaDescription: string;
  readTime: number | null;
}
