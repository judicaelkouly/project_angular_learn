import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../../services/article';
import { Articles } from '../../../models/article.model';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Component({
  selector: 'app-update-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-article.html',
  styleUrls: ['./update-article.css'],
})
export class UpdateArticle implements OnInit {
  private fb = inject(FormBuilder);
  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private articleId = 0;

  article = signal<Articles | null>(null);
  isFetching = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  showImageUploader = signal(false);

  displayedImage = computed(() => this.imagePreview() ?? this.article()?.img ?? null);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    content: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.articleId = Number(this.route.snapshot.paramMap.get('id'));

    this.isFetching.set(true);
    this.errorMessage.set(null);

    this.articleService.getArticle(this.articleId).subscribe({
      next: (article) => {
        this.article.set(article);

        this.form.patchValue({ title: article.title, content: article.content });

        this.showImageUploader.set(!!article.img);
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

  toggleImageUploader() {
    this.showImageUploader.update((v) => !v);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.errorMessage.set(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage.set('Format non supporté (JPEG, PNG, WebP ou GIF).');
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      this.errorMessage.set('Image trop lourde (5 Mo maximum).');
      input.value = '';
      return;
    }

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);

    input.value = '';
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  onSubmit() {
    if (this.isSubmitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { title, content } = this.form.getRawValue();

    this.articleService
      .updateArticle(this.articleId, { title, content, image: this.selectedFile() })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message ?? 'Erreur lors de la modification de l’article.');
        },
      });
  }
}
