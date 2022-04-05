import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

import { CalendarMode, Step } from 'ionic2-calendar/calendar';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { ApiResponse } from '../models/response';

registerLocaleData(localePl);

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {

  scheduleData; //tablica danych do korzystania z API
  eventSource: Array<any>; //tablica wydarzeń
  viewTitle: String; //nagłówek z datą itd.

  constructor(
    private activatedRoute: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.scheduleData = JSON.parse(localStorage.getItem("schedules"))[0].values;

    //pobieranie danych z API
    this.api
      .getSchedule(this.scheduleData?.type, this.scheduleData.department, this.scheduleData.cycle, this.scheduleData.year, this.scheduleData.group)
      .subscribe((data: ApiResponse) => {
        if (data.status == 'ok') {
          this.loadEvents(data.message);
        }
      });
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
        let dzien = date.toLocaleDateString('pl-PL', { weekday: 'long' });
        return dzien.charAt(0).toUpperCase() + dzien.slice(1) + ", " + date.getDate() + " " + date.toLocaleDateString('pl-PL', { month: 'long' });;
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

  //łądowanie i konwersja danych
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
        }
      }
      //przewiń do kolejnego dnia
      date.setDate(date.getDate() + 1);
    }
    //na końcu wstaw tablicę sparsownych wydarzeń do komponentu
    this.eventSource = events;
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
}