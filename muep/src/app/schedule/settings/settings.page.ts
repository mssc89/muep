import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ScheduleData } from 'src/app/models/schedule-data';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private storage: StorageService
  ) { }

  schedules: Array<ScheduleData>;

  ngOnInit() {
    this.schedules = this.storage.getSchedulesData();
    console.log(this.schedules)
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

}
