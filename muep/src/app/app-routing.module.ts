import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SetupGuard } from './guards/setup.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./schedule/schedule.module').then( m => m.SchedulePageModule),
    canActivate: [SetupGuard]
  },
  {
    path: 'setup',
    loadChildren: () => import('./setup/setup.module').then( m => m.SetupPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then( m => m.AboutPageModule)
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
