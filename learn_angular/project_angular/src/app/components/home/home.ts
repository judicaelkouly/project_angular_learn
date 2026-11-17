import { Component, inject } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { ArticlesComponent } from '../articles/articles';
import { ArticleService } from '../../services/article';

@Component({
  imports: [Navbar, Footer, ArticlesComponent],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {


}


