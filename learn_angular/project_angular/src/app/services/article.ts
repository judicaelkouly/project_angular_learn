import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Articles, ArticleInput } from '../models/article.model';

@Service()
export class ArticleService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000';

  private toFormData({ title, content, image }: ArticleInput) {
  const fd = new FormData();
  fd.append('title', title);
  fd.append('content', content);
  if (image) fd.append('image', image);
  return fd;
}

  getArticles(searchKey: string = "") {
    return this.http.get<Articles[]>(`${this.api}/articles?_sort=createdAt&_order=desc`+"&q="+searchKey);
  }

  getArticle(id: number) {
    return this.http.get<Articles>(`${this.api}/articles/${id}`);
  }

  getMyArticles() {
    return this.http.get<Articles []>(`${this.api}/me/articles`);
  }

  createArticle(article: ArticleInput) {
  return this.http.post<Articles>(`${this.api}/articles`, this.toFormData(article));
}

 updateArticle(id: number, article: ArticleInput) {
  return this.http.put<Articles>(`${this.api}/articles/${id}`, this.toFormData(article));
}

  deleteArticle(id: number) {
    return this.http.delete<void>(`${this.api}/articles/${id}`);
  }

}
