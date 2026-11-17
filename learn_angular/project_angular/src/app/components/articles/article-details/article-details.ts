import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Footer } from '../../footer/footer';
import { Navbar } from '../../navbar/navbar';
import { ArticleService } from '../../../services/article';
import { Articles } from '../../../models/article.model';

@Component({
  imports: [Footer, Navbar],
  selector: 'app-article-details',
  styleUrl: './article-details.css',
  templateUrl: './article-details.html',
})
export class ArticleDetails implements OnInit {
  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);

  article = signal<Articles | null>(null);
  isFetching = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.isFetching.set(true);
    this.errorMessage.set(null);

    this.articleService.getArticle(id).subscribe({
      next: (article) => {
        this.article.set(article);
        this.isFetching.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l’article :', err);
        this.errorMessage.set(
          err.status === 404
            ? 'Article introuvable.'
            : err.status === 401
              ? 'Session expirée, reconnecte-toi.'
              : 'Impossible de charger l’article.'
        );
        this.isFetching.set(false);
      },
    });
  }
}
