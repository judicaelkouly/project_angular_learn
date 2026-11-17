import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
})
export class Footer {
  // Vous pouvez ajouter ici la logique de soumission de la newsletter si nécessaire
  onSubscribe(email: string) {
    if (email) {
      console.log('Email souscrit :', email);
    }
  }
}
