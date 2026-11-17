export interface Articles {
  id: number;
  title: string;
  content: string;
  img: string | null;
  authorId: number;
  authorName: string;
  createdAt: string;
}

export type ArticleInput = { title: string; content: string; image?: File | null };
