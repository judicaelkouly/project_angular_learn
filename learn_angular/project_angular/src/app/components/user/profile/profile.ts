import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from '../../../services/user';
import { ArticleService } from '../../../services/article';
import { Articles} from '../../../models/article.model';
import { TimeAgoPipe } from '../../../time-ago.pipe';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matAutoDeleteFillOutline } from '@ng-icons/material-symbols/outline';
import { matEditOutline } from '@ng-icons/material-symbols/outline';
import { matUndereyeSharp } from '@ng-icons/material-symbols/sharp';




@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, TimeAgoPipe, NgIcon],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  providers: [provideIcons({ matAutoDeleteFillOutline, matEditOutline, matUndereyeSharp })],
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private articleService = inject(ArticleService);


  router = inject(Router);

   detailsArticle(articleId: number): void{
          this.router.navigate(['/details', articleId])
  }
   dataArticle(articleId: number): void{
          this.router.navigate(['/update', articleId])
  }

  currentUser = this.userService.currentUser;

  userArticlesList = signal<Articles[]>([]);
  isFetching = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.isFetching.set(true);
    this.errorMessage.set(null);

    forkJoin({
      user: this.userService.loadCurrentUser(),
      articles: this.articleService.getMyArticles(),
    }).subscribe({
      next: ({ articles }) => {
        this.userArticlesList.set(articles);
        this.isFetching.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil :', err);
        this.errorMessage.set(
          err.status === 401
            ? 'Session expirée, reconnecte-toi.'
            : 'Impossible de charger le profil.'
        );
        this.isFetching.set(false);
      },
    });
  }

  removeArticle(id: number){
    if (!confirm('Supprimer définitivement cet article ?')) return;
    
    this.articleService.deleteArticle(id).subscribe(
   {next: () => {
      this.userArticlesList.update((list) => list.filter((a) => a.id !== id));
    },
     error: (err) => {
      this.errorMessage.set(err.error?.message ?? 'Impossible de supprimer l’article.');
    },
  })
  }
}
