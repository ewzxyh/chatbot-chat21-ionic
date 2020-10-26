import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';


// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';

// services
import { EventsService } from '../events-service';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })

export class FirebaseAuthService extends AuthService {

  private tenant: string;
  public token: any;
  public user: any;

  private refUser: firebase.database.Reference;
  private urlNodeContacts: string;
  private TOKEN: string;
  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_CREATE_CUSTOM_TOKEN: string;

  constructor(
    private events: EventsService,
    public http: HttpClient
  ) {
    super();
    // tslint:disable-next-line: max-line-length
    this.TOKEN = '[REDACTED_JWT]';
    this.URL_TILEDESK_SIGNIN = 'https://tiledesk-server-pre.herokuapp.com/auth/signin';
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = 'https://tiledesk-server-pre.herokuapp.com/chat21/firebase/auth/createCustomToken';
  }

  /**
   *
   */
  initialize(tenant: string) {
    this.tenant = tenant;
    this.urlNodeContacts = '/apps/' + this.tenant + '/contacts/';
    this.onAuthStateChanged();
  }

  /**
   *
   */
  getUser(): firebase.User {
    return firebase.auth().currentUser;
  }


  /** */
  getToken(): string {
    console.log('UserService::getToken');
    return this.TOKEN;
  }

// ********************* START FIREBASE AUTH ********************* //
  /**
   * FIREBASE: onAuthStateChanged
   */
  onAuthStateChanged() {
    console.log('UserService::onAuthStateChanged');

    firebase.auth().onAuthStateChanged(user => {
      console.log(' onAuthStateChanged', user);
      if (!user) {
        console.log(' 3 - PASSO OFFLINE AL CHAT MANAGER');
        this.events.publish('go-off-line');
        // this.chatManager.goOffLine();
      } else {
        // console.log('UserService::onAuthStateChanged::user:' + firebase.auth().currentUser.getIdToken(false));
        // console.log(user.getIdToken(false));
        // console.log(' 1 - IMPOSTO STATO CONNESSO UTENTE ');
        // this.chatPresenceHandler.setupMyPresence(user.uid);

        // console.log(' 2 - AGGIORNO IL TOKEN ::: ');
        // this.updateTokenOnAuthStateIsLogin();

        console.log(' 3 - CARICO IL DETTAGLIO UTENTE ::: ');
        // this.updateUserDetail(user);

        console.log(' 4 - PASSO ONLINE AL CHAT MANAGER');
        // this.chatManager.goOnLine(user);
        // var user = firebase.auth().currentUser;
        // user.providerData.forEach((profile) => {
        //   console.log("Sign-in provider: " + profile.providerId);
        //   console.log("  Provider-specific UID: " + profile.uid);
        //   console.log("  phoneNumber: " + profile.phoneNumber);
        //   console.log("  Name: " + profile.displayName);
        //   console.log("  Email: " + profile.email);
        //   console.log("  Photo URL: " + profile.photoURL);
        // });
        this.events.publish('go-on-line', user);
      }
    });
  }


  /** */
  updateTokenOnAuthStateIsLogin() {
    const taht = this;
    firebase.auth().currentUser.getIdToken(false)
    .then((token) => {
      console.log('idToken.', token);
    }).catch((error) => {
      console.log('idToken error: ', error);
    });
    // console.log(' 2 - AGGIORNO IL TOKEN ::: ');
    // const keySubscription = 'eventGetToken';
    // this.events.subscribe(keySubscription,  (token) => {
    //   console.log(' 4 - callbackGetToken');
    //   //this.msgService.updateToken(userUid, token);
    //   this.token = token;
    // });
    // this.msgService.getToken();
  }


  // Create User Anonymous
  // createAnonymousUser(): firebase.Promise<any> {
  //   return this.fireAuth.signInAnonymously();
  // }

  // Login with Email
  doLoginFirebase(email: string, password: string): any {
    // return this.fireAuth.signInWithEmailAndPassword(email, password);
    // var token = '[REDACTED_JWT]';
    // var token = '[REDACTED_JWT]';
    this.signInWithCustomToken(this.TOKEN);
  }


  /**
   * FIREBASE: signInWithCustomToken
   * @param token
   */
  signInWithCustomToken(token: string): any {
    console.log('signInWithCustomToken:', token);
    const that = this;
    return firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then( async () => {
      return firebase.auth().signInWithCustomToken(token)
      .then( async (response) => {
        that.setUserAndToken(response);
        that.events.publish('firebase-sign-in-with-custom-token', response, null);
      })
      .catch((error) => {
        console.error('Error: ', error);
        that.events.publish('firebase-sign-in-with-custom-token', null, error);
      });
    })
    .catch((error) => {
      console.error('Error: ', error);
      that.events.publish('firebase-sign-in-with-custom-token', null, error);
    });
  }

  // signInWithCustomToken(token: string) {
  //   console.log('signInWithCustomToken:', token);
  //   const that = this;
  //   firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  //   .then( async () => {
  //     try {
  //       const response = await firebase.auth().signInWithCustomToken(token);
  //       that.events.publish('firebase-sign-in-with-custom-token', response);
  //       return response;
  //     } catch (error) {
  //       console.log('error: ', error.message);
  //     }
  //   })
  //   .catch((error) => {
  //     console.error('Error setting firebase auth persistence', error);
  //   });
  // }

  /**
   * FIREBASE: createUserWithEmailAndPassword
   * @param email
   * @param password
   * @param firstname
   * @param lastname
   */
  createUserWithEmailAndPassword(email: string, password: string): any {
    const that = this;
    return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((response) => {
      that.events.publish('firebase-create-user-with-email-and-password', response);
      return response;
    })
    .catch((error) => {
        console.log('error: ', error.message);
        return error;
    });
  }

  /**
   * FIREBASE: sendPasswordResetEmail
   */
  sendPasswordResetEmail(email: string): any {
    const that = this;
    return firebase.auth().sendPasswordResetEmail(email).
    then(() => {
      console.log('OK');
      that.events.publish('firebase-send-password-reset-email', email);
    }).catch((error) => {
      console.log('error: ', error);
    });
  }

  /**
   * FIREBASE: signOut
   */
  async signOut() {
    const that = this;
    console.log('FirebaseAuthService::logoutUser');
    try {
      await firebase.auth().signOut();
      console.log('OK');
      that.events.publish('firebase-sign-out');
    } catch (error) {
      console.log('error: ', error);
    }
  }

  /**
   * FIREBASE: currentUser delete
   */
  delete() {
    const that = this;
    const user = firebase.auth().currentUser;
    user.delete().then(() => {
      console.log('OK');
      that.events.publish('firebase-current-user-delete');
    }).catch((error) => {
      console.log('error: ', error);
    });
  }

// ********************* END FIREBASE AUTH ********************* //





// ********************* TILEDESK AUTH ********************* //
  /**
   *
   * @param email
   * @param password
   */
  signInWithEmailAndPassword(email: string, password: string) {
    console.log('signInWithEmailAndPassword', email, password);
    this.signIn(this.URL_TILEDESK_SIGNIN, email, password);
  }

  /**
   * https://www.techiediaries.com/ionic-http-post/
   * @param url
   * @param email
   * @param password
   */
  private signIn(url: string, email: string, password: string) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json' );
    const requestOptions = { headers: httpHeaders };
    const postData = {
      'email': email,
      'password': password
    };
    const that = this;
    this.http.post(url, postData, requestOptions)
      .subscribe(data => {
        console.log(data);
        if (data['success'] && data['token']) {
          const token = data['token'];
          that.createCustomToken(token);
        }
      }, error => {
        console.log(error);
        that.events.publish('sign-in', null, error);
      });
  }

  /**
   *
   * @param token
   */
  private createCustomToken(token: string) {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: token
    });
    const responseType = 'text';
    const postData = {};
    const that = this;
    this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType})
    .subscribe(data =>  {
      that.signInWithCustomToken(data);
    }, error => {
      console.log(error);
      that.events.publish('sign-in', null, error);
    });
  }


  private setUserAndToken(resp: any) {
    console.log(resp);
    try {
      if (resp.token) {
        this.token = resp.token;
      }
      if (resp.user) {
        this.user = resp.user;
        this.events.publish('sign-in', resp.user, null);
      }
    } catch (error) {
      console.log('error: ', error);
      this.events.publish('sign-in', null, error);
    }
  }

  /**
   *
   * @param error
   */
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }



}
