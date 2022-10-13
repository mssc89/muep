import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

import { CalendarMode, Step } from 'ionic2-calendar/calendar';
import { registerLocaleData } from '@angular/common';
import { ModalController } from '@ionic/angular';
import localePl from '@angular/common/locales/pl';
import { ApiResponse } from '../models/response';
import { StorageService } from '../services/storage.service';

import { SettingsPage } from './settings/settings.page';

import { ScheduleData } from '../models/schedule-data';

registerLocaleData(localePl);

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {

  schedules: Array<ScheduleData>; //tablica danych do korzystania z API
  eventSource: Array<any> = []; //tablica wydarzeń
  viewTitle: String; //nagłówek z datą itd.

  constructor(
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private storage: StorageService,
    public modalController: ModalController
  ) {}

  ngOnInit() {
    this.schedules = this.storage.getSchedules();

    //pobieranie danych z API
    for(let schedule of this.schedules){
      this.api
        .getSchedule(schedule.values.type.id, schedule.values.department.id, schedule.values.cycle.id, schedule.values.year.id, schedule.values.group.id)
        .subscribe((data: ApiResponse) => {
          if (data.status == 'ok') {
            this.loadEvents(data.message);

            //jeśli user podał numer albumu, pobierz dane z spnjo
            if(typeof schedule.values.album !== 'undefined'){
              this.api
              .getSPNJO(schedule.values.album)
              .subscribe((data: ApiResponse) => {
                if (data.status == 'ok') {
                  this.loadSPNJO(data.message);
                }
              });
            }
          }
      });
    }
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: SettingsPage,
    });

    return await modal.present();
  }

  calendar = {
    locale: 'pl-PL',
    formatHourColumn: 'HH:mm:ss',
    mode: 'day' as CalendarMode,
    step: 1 as Step,
    currentDate: new Date(),
    dateFormatter: {
      //formatowanie nagłówku dnia: dodawanie duzej litery, dzień i miesiąc
      formatDayViewTitle: function(date: Date) {
        let miesiace = [
          "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
        ]
        let dzien = date.toLocaleDateString('pl-PL', { weekday: 'long' });
        return dzien.charAt(0).toUpperCase() + dzien.slice(1) + ", " + date.getDate() + " " + miesiace[date.getMonth()];
      },
      //formatowanie nagłówku tygodnia: miesiące w odpowiedniej odmianie/przypadku oraz numer tygodnia
      formatWeekViewTitle: function(date: Date) {
        let miesiace = [
          "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
        ]
        var pierwszy = new Date(date.getFullYear(),0,1);
        var iloscDni = Math.floor((date.getTime() - pierwszy.getTime()) / (24 * 60 * 60 * 1000));
        var tydzien = Math.ceil((date.getDay() + 1 + iloscDni) / 7);

        return miesiace[date.getMonth()] + " " + date.getFullYear() + ", tydzień " + tydzien;
      }
    }
  };

  //ładowanie i konwersja danych z SPNJO
  loadSPNJO(data){
    let events = []; //tablica wydarzeń wstawiana do komponentu kalendarza
    let date = new Date(); //dzisiejsza data

    //parsuj dane dzień po dniu
    //najpierw znajdź jaki to będzie dzień, aka weź datę miesiąc temu i inkrementuj tak długo az będzie sie zgadzać
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 31);

    for (let i = 0; i <= 62; i++) {
      //znajdź nazwę słowną dnia bo takie dane dostaniemy z API
      let dzien = date.toLocaleDateString('pl-PL', { weekday: 'long' });

      //dla kazdego dnia z API, sprawdzaj czy dzień się zgadza
      for(let clas of data){
        if (dzien == clas.day.toLowerCase()) {

          //rozmnóz kropki
          clas.time = clas.time.replace(".",":")

          //data (godzina) początkowa zajęć
          let start = new Date(date.getTime());
          let hour = clas.time.split('-')[0].split(':')[0];
          let minute = clas.time.split('-')[0].split(':')[1];
          start.setHours(parseInt(hour));
          start.setMinutes(parseInt(minute));

          //data (godzina) końcowa zajęć
          let end = new Date(date.getTime());
          hour = clas.time.split('-')[1].split(':')[0];
          minute = clas.time.split('-')[1].split(':')[1];
          end.setHours(parseInt(hour));
          end.setMinutes(parseInt(minute));

          events.push({
            noClasses: false,
            time: clas.time,
            lesson: clas.language,
            place: clas.place,
            lecturer: clas.lecturer,
            title: clas.time + ' ' + clas.place + ' ' + clas.language,
            startTime: start,
            endTime: end,
            allDay: false,
          });
        }
      }
      //przewiń do kolejnego dnia
      date.setDate(date.getDate() + 1);
    }

    //łączenie z istniejącą tablicą zajęć
    for(let event of this.eventSource){
      //jeśli istnieją juz puste elementy (aka "dzisiaj wolne") które nakładają się na lektoraty to usuń je
      if(event.noClasses == true){
        for(let eventSPNJO of events){
          if(this.getDateString(event.startTime) == this.getDateString(eventSPNJO.startTime)){
            this.eventSource = this.eventSource.filter(x => x!=event);
          }
        }
      }
    }
    this.eventSource = this.eventSource.concat(events)
  }

  //ładowanie i konwersja danych
  loadEvents(data) {
    let events = []; //tablica wydarzeń wstawiana do komponentu kalendarza
    let date = new Date(); //dzisiejsza data

    //parsuj dane dzień po dniu
    //najpierw znajdź jaki to będzie dzień, aka weź datę miesiąc temu i inkrementuj tak długo az będzie sie zgadzać
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 31);

    for (let i = 0; i <= 62; i++) {
      //znajdź nazwę słowną dnia bo takie dane dostaniemy z API
      let dzien = date.toLocaleDateString('pl-PL', { weekday: 'long' });

      //dla kazdego dnia z API, sprawdzaj czy dzień się zgadza
      for (let day of data) {
        if (dzien == day.day.toLowerCase()) {

          //jeśli uzytkownik podał nr albumu, usuń z tablicy lektoraty ogólne
          if(typeof this.schedules[0].values.album !== 'undefined'){
            day.classes = day.classes.filter(x => !(x.lesson.includes("(Lek)")));
          }

          for (let clas of day.classes) {
            //data (godzina) początkowa zajęć
            let start = new Date(date.getTime());
            let hour = clas.time.split('-')[0].split(':')[0];
            let minute = clas.time.split('-')[0].split(':')[1];
            start.setHours(parseInt(hour));
            start.setMinutes(parseInt(minute));

            //data (godzina) końcowa zajęć
            let end = new Date(date.getTime());
            hour = clas.time.split('-')[1].split(':')[0];
            minute = clas.time.split('-')[1].split(':')[1];
            end.setHours(parseInt(hour));
            end.setMinutes(parseInt(minute));

            //dodaj do tablicy wydarzeń
            events.push({
              noClasses: false,
              time: clas.time,
              lesson: clas.lesson,
              place: clas.place,
              lecturer: clas.lecturer,
              title: clas.time + ' ' + clas.place + ' ' + clas.lesson,
              startTime: start,
              endTime: end,
              allDay: false,
            });
          }

          //jeśli danego dnia nie ma zajęć
          if(day.classes.length == 0){
            let start = new Date(date.getTime());
            start.setHours(0);
            start.setMinutes(0);

            let end = new Date(date.getTime());
            end.setHours(20);
            end.setMinutes(58);

            events.push({
              noClasses: true,
              title:"",
              startTime: start,
              endTime: end,
              allDay: false,
            });
          }
        }
      }

      //przewiń do kolejnego dnia
      date.setDate(date.getDate() + 1);
    }
    //na końcu wstaw tablicę sparsownych wydarzeń do komponentu
    this.eventSource = this.eventSource.concat(events);
  }

  //zmiana nagłówka
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  onEventSelected(event) {
    console.log(
      'Event selected:' +
        event.startTime +
        '-' +
        event.endTime +
        ',' +
        event.title
    );
  }

  //zmiana trybu kalendarza
  changeMode(mode) {
    this.calendar.mode = mode.detail.value;
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  //zmiana dnia w widoku dnia
  //user moze przewijac tylko w zakresie aktualnego tygodnia
  changeDay(mode){
    if(mode == "next"){
      let wczoraj = this.calendar.currentDate;
      if(wczoraj.getDay() != 0){
        wczoraj.setDate(wczoraj.getDate()+1);
        this.calendar.currentDate = new Date(wczoraj);
      }
    }
    else if(mode == "prev"){
      let jutro = this.calendar.currentDate;
      if(jutro.getDay() != 1){
        jutro.setDate(jutro.getDate()-1);
        this.calendar.currentDate = new Date(jutro);
      }
    }
  }

  //ustawianie limitu przewijania w widoku dniowym
  //aka user moze przewijac tylko w zakresie aktualnego tygodnia
  swipeGuard(){
  }

  //zwróć string dd/mm/yyyy z daty
  getDateString(date: Date){
    return date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
  }
}
