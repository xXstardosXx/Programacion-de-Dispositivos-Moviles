import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs/explore', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: '', redirectTo: 'explore', pathMatch: 'full' },
      {
        path: 'explore',
        loadComponent: () => import('./pages/explore/explore.page').then((m) => m.ExplorePage),
      },
      {
        path: 'my-reviews',
        loadComponent: () =>
          import('./pages/my-reviews/my-reviews.page').then((m) => m.MyReviewsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
    ],
  },
  {
    path: 'game/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/game-detail/game-detail.page').then((m) => m.GameDetailPage),
  },
  { path: '**', redirectTo: 'tabs/explore' },
];
