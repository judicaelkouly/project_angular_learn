import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArticleService } from '../../services/article';
import { Articles } from '../../models/article.model';
import { TimeAgoPipe } from '../../time-ago.pipe';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, Pagination],
  templateUrl: './articles.html',
  styleUrls: ['./articles.css'],
})
export class ArticlesComponent implements OnInit {

itemsPerPage = 9;
currentPage = 1;

  private articleService = inject(ArticleService);
  private router = inject(Router);

  listArticles = signal<Articles[]>([]);
  isFetching = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.getArticles();
  }

  detailsArticle(articleId: number): void {
    this.router.navigate(['/details', articleId]);
  }

   searchByKeyword(searchkeyword: string) {
    this.currentPage = 1;
    this.getArticles(searchkeyword);
  }


  getArticles(searchKey: string = '') {
    this.isFetching.set(true);
    this.errorMessage.set(null);
    console.log(searchKey)

    this.articleService.getArticles(searchKey).subscribe({
      next: (articles) => {
        this.listArticles.set(articles);
        this.isFetching.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des articles :', err);
        this.errorMessage.set(
          err.status === 401
            ? 'Session expirée, reconnecte-toi.'
            : 'Impossible de charger les articles.'
        );
        this.isFetching.set(false);
      },


    });
  }

 get paginatedData(){
  const start = (this.currentPage -1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;

  return this.listArticles().slice(start, end)
 }

  changePage(page: number){
    this.currentPage = page;

  }
}
