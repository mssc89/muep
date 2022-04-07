import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScheduleData } from 'src/app/models/schedule-data';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-done',
  templateUrl: './done.page.html',
  styleUrls: ['./done.page.scss'],
})
export class DonePage implements OnInit {

  scheduleData: ScheduleData;

  constructor(private router: Router, private storage: StorageService) { }

  ngOnInit() {
    this.scheduleData = this.storage.getScheduleData();
  }

  done(){
    this.router.navigate(['/schedule'])
  }

}
