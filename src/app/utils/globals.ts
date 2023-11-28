import { style } from '@angular/animations';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

/** CONSTANTS */
import { CHANNEL_TYPE_GROUP } from 'src/chat21-core/utils/constants';
import { getParameterByName } from 'src/chat21-core/utils/utils';


@Injectable({
    providedIn: 'root'
  })
export class Globals {

  windowContext;
  
  supportMode: boolean;
  tenant: string;
  logLevel: string
  persistence: string;
  lang: string;
  jwt: string;

  constructor(
  ) { }


  /**
   * 1: initParameters
   */
  initDefafultParameters() {

    let wContext: any = window;
    // this.parameters['windowContext'] = windowContext;
    this.windowContext = wContext;

    this.supportMode = true
    this.tenant = 'tilechat'
    this.logLevel = 'ERROR'
    this.persistence = 'local';
    this.lang = 'en'

  }




  

}