import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchedulePageRoutingModule } from './schedule-routing.module';

import { SchedulePage } from './schedule.page';
import { NgCalendarModule } from 'ionic2-calendar';
import { AdComponent } from '../ad/ad.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedulePageRoutingModule,
    NgCalendarModule,
  ],
  declarations: [SchedulePage, AdComponent]
})
export class SchedulePageModule {}
