import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetupPage } from './setup.page';

const routes: Routes = [
  {
    path: '',
    component: SetupPage
  },
  {
    path: 'done',
    loadChildren: () => import('./done/done.module').then( m => m.DonePageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetupPageRoutingModule {}
