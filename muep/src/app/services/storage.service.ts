import { Injectable } from '@angular/core';
import { ScheduleData } from '../models/schedule-data';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  getScheduleData(){
    let schedule = JSON.parse(localStorage.getItem("schedules"))[0];
    return new ScheduleData(schedule.name, schedule.values);
  }

  getSchedulesData(){
    let schedules = JSON.parse(localStorage.getItem("schedules"));
    return schedules;
  }
}
