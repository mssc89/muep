import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  //rootURL = 'https://muep.app/api';
  rootURL = 'http://localhost:8080/api';

  getSchedule(type: Number, department: Number, cycle: Number, year: Number, group: Number): Observable<any> {
    return this.http.post(this.rootURL + '/schedule',{ type:type, department: department, cycle:cycle, year:year, group:group });
  }

  getSPNJO(album: Number): Observable<any> {
    return this.http.post(this.rootURL + '/spnjo2',{ album:album });
  }

  getDeps(type: Number): Observable<any> {
    return this.http.post(this.rootURL + '/getDeps',{ type:type });
  }

  getYears(type: Number, department: Number, cycle: Number): Observable<any> {
    return this.http.post(this.rootURL + '/getYears',{ type:type, department: department, cycle: cycle });
  }

  getGroups(type: Number, department: Number, cycle: Number, year: Number): Observable<any> {
    return this.http.post(this.rootURL + '/getGroups',{ type:type, department: department, cycle: cycle, year: year });
  }
}
