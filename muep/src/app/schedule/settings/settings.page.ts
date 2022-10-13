import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';
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
    private storage: StorageService,
    private alertController: AlertController
  ) { }

  schedules: Array<ScheduleData>;

  ngOnInit() {
    this.schedules = this.storage.getSchedules();
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async showAlert(schedule: ScheduleData) {
    const alert = await this.alertController.create({
      header: 'Usunąć?',
      subHeader: 'Czy na pewno chcesz usunąć ten plan?',
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel'
        },
        {
          text: 'Ok',
          role: 'confirm',
          handler: () => {
            this.storage.removeSchedule(schedule)
            this.schedules = this.storage.getSchedules();
          },
        },
      ],
    });

    await alert.present();
  }

}
