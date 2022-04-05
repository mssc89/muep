import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Plan', url: '/schedule', icon: 'calendar' },
    { title: 'O aplikacji', url: '/about', icon: 'information-circle' },
  ];
  constructor() {

  }
}
