import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '../../../services/article';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-article.html',
  styleUrls: ['./add-article.css'],
})
export class AddArticle {
  private fb = inject(FormBuilder);
  private articleService = inject(ArticleService);
  private router = inject(Router);

  // État de l'écran (signals : l'affichage se met à jour tout seul)
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  showImageUploader = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Le formulaire ne contient que du texte. Le fichier image est gardé à part
  // (selectedFile) et sera ajouté à l'envoi, dans la même requête.
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    content: ['', [Validators.required]],
  });

  // Afficher/masquer le cadre d'upload d'image
  toggleImageUploader() {
    this.showImageUploader.update((v) => !v);
  }

  // L'utilisateur choisit une image dans sa galerie
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

    // On garde le fichier en mémoire : il sera envoyé avec l'article au clic sur "Ajouter"
    this.selectedFile.set(file);

    // Aperçu local uniquement : rien n'est envoyé au serveur à ce stade
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);

    // Permet de re-choisir le même fichier après l'avoir retiré
    input.value = '';
  }

  // Retirer l'image sélectionnée
  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  // Soumission du formulaire : une seule requête (titre + description + image éventuelle)
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
      .createArticle({ title, content, image: this.selectedFile() })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message ?? 'Erreur lors de la création de l’article.');
        },
      });
  }
}
