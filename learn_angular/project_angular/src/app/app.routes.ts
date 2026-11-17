import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Register } from './components/auth/register/register';
import { Login } from './components/auth/login/login';
import {  AddArticle } from './components/form/add-article/add-article';
import {  UpdateArticle } from './components/form/update-article/update-article';
import {  Profile } from './components/user/profile/profile';
import { ArticleDetails } from './components/articles/article-details/article-details';



export const routes: Routes = [

  {path: "", component: Home},
  {path: "register", component: Register},
  {path: "login", component: Login},
  {path: "add-article", component: AddArticle},
  {path: "update/:id", component: UpdateArticle},
  {path: "profile", component: Profile},
  {path: "details/:id", component: ArticleDetails},
  {path: "**", redirectTo: ""}

  ];
