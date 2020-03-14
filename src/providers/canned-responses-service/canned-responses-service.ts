import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the CannedResponsesServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()

export class CannedResponsesServiceProvider {
  httpOptions = {}

  constructor(public http: HttpClient) {
    console.log('Hello CannedResponsesServiceProvider Provider');
  }

  



  getCannedResponses(SERVER_BASE_URL, projectId){
    // https://tiledesk-server-pre.herokuapp.com/5e20a68e7c2e640017f2f40f/canned/  // example
    var url = SERVER_BASE_URL + projectId + "/canned/";
    console.log('CANNED-RES.SERV - GET CANNED-RES URL', url);
    const token = this.getTokenFromLocalStorage();
    return this.http.get(url, {
      headers: new HttpHeaders().set('Authorization', token),
    })
    // .toPromise()
    // .then(data => {
    //   console.log('----------------------------------> getCannedResponses:');
    //   console.log(data);
    // }).catch(err => {
    //   console.log('error', err);
    // });
  }


  getTokenFromLocalStorage() {
    var token = "JWT [REDACTED_JWT]";
    var user = JSON.parse(localStorage.getItem('user'));
    //alert(user);
    if(user){
      console.log('user: ', user);
      if(user.token){
          token = user.token;
          console.log('token: ', user.token);
      } 
    }
    return token;
  }



}
