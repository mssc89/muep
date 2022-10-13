import { Injectable } from '@angular/core';
import { ScheduleData } from '../models/schedule-data';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  getSchedules(){
    let schedules = JSON.parse(localStorage.getItem("schedules"));
    return <Array<ScheduleData>>schedules;
  }

  setSchedules(schedules: Array<ScheduleData>){
    localStorage.setItem("schedules",JSON.stringify(schedules))
  }

  addSchedule(schedule: ScheduleData){
    let schedules = this.getSchedules();
    if(!schedules){
      schedules = [];
    }
    schedules.push(schedule);
    this.setSchedules(schedules);
  }

  removeSchedule(schedule: ScheduleData){
    let schedules = this.getSchedules();
    schedules = schedules.filter(x => x.name != schedule.name);
    this.setSchedules(schedules);
  }

  isEmpty(){
    if(!this.getSchedules() || this.getSchedules().length == 0){
      return true;
    }
    return false;
  }
}
