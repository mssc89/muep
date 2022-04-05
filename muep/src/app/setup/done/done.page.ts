import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-done',
  templateUrl: './done.page.html',
  styleUrls: ['./done.page.scss'],
})
export class DonePage implements OnInit {

  data: Array<any>;

  constructor(private router: Router) { }

  ngOnInit() {
    this.data = JSON.parse(localStorage.getItem("schedules"))[0].values;
  }

  done(){
    this.router.navigate(['/schedule'])
  }

}
