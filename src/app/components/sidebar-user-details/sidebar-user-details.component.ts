import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { skip } from 'rxjs/operators';
import { AppConfigProvider } from 'src/app/services/app-config';
import { EventsService } from 'src/app/services/events-service';
import { tranlatedLanguage } from '../../../chat21-core/utils/constants';
import { avatarPlaceholder, getColorBck } from 'src/chat21-core/utils/utils-user';
import * as PACKAGE from 'package.json';
@Component({
  selector: 'app-sidebar-user-details',
  templateUrl: './sidebar-user-details.component.html',
  styleUrls: ['./sidebar-user-details.component.scss'],
})
export class SidebarUserDetailsComponent implements OnInit, OnChanges {
  // HAS_CLICKED_OPEN_USER_DETAIL: boolean = false;
  // @Output() onCloseUserDetailsSidebar = new EventEmitter();


  public browserLang: string;
  private logger: LoggerService = LoggerInstance.getInstance()
  chat_lang: string
  flag_url: string;
  photo_profile_URL: string;
  IS_BUSY: boolean;
  IS_AVAILABLE: boolean;
  USER_ROLE: boolean;
  USER_ROLE_LABEL: string;
  EditProfileLabel: string;
  IS_BUSY_msg: string;
  IS_AVAILABLE_msg: string;
  IS_UNAVAILABLE_msg: string;
  SUBSCRIPTION_PAYMENT_PROBLEM_msg: string;
  THE_PLAN_HAS_EXPIRED_msg: string;
  PAYD_PLAN_NAME_PRO_msg: string;
  PAYD_PLAN_NAME_ENTERPRISE_msg: string;
  PRO_PLAN_TRIAL_msg: string;
  FREE_PLAN_msg: string;
  LOGOUT_msg: string;
  profile_name_translated: string;
  SubscriptionPaymentProblem: string;
  user: any
  tiledeskToken: string;
  project: { _id: string, name: string, type: string, isActiveSubscription: boolean, plan_name: string}
  _prjct_profile_name: string;

  isVisiblePAY: boolean;
  public_Key: any
  USER_PHOTO_PROFILE_EXIST: boolean;
  version: string
  company_name: string = 'Tiledesk'
  DASHBOARD_URL: string;
  constructor(
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
    private messagingAuthService: MessagingAuthService,
    public wsService: WebsocketService,
    public appConfigProvider: AppConfigProvider,
    public events: EventsService,
    private eRef: ElementRef,

  ) { }

  ngOnInit() {
    this.DASHBOARD_URL = this.appConfigProvider.getConfig().dashboardUrl + '#/project/';
    this.version = PACKAGE.version;
    this.subcribeToAuthStateChanged();
    this.listenTocurrentProjectUserUserAvailability$();
    this.listenToCurrentStoredProject();
    this.getOSCODE();
    // this.listenOpenUserSidebarEvent();
  }

  subcribeToAuthStateChanged() {
    this.messagingAuthService.BSAuthStateChanged.subscribe((state) => {
      this.logger.log('[SIDEBAR-USER-DETAILS] BSAuthStateChanged ', state)

      if (state === 'online') {
        const storedCurrentUser = this.appStorageService.getItem('currentUser')
        if (storedCurrentUser && storedCurrentUser !== 'undefined') {
          const currentUser = JSON.parse(storedCurrentUser);
          this.logger.log('[SIDEBAR-USER-DETAILS] - subcribeToAuthStateChanged - currentUser ', currentUser)
          if (currentUser) {
            this.user = currentUser;
            this.getCurrentChatLangAndTranslateLabels(this.user);
            this.photo_profile_URL = this.imageRepoService.getImagePhotoUrl(this.user.uid)
            this.logger.log('[SIDEBAR-USER-DETAILS] photo_profile_URL ', this.photo_profile_URL);
            this.checkIfExistPhotoProfile(this.photo_profile_URL)
          }
        } else {
          this.logger.error('[SIDEBAR-USER-DETAILS] currentUser not found in storage ')
        }
      }
    })
  }

  checkIfExistPhotoProfile(imageUrl) {
    this.verifyImageURL(imageUrl, (imageExists) => {

      if (imageExists === true) {
        this.USER_PHOTO_PROFILE_EXIST = true;
        this.logger.log('[SIDEBAR-USER-DETAILS] photo_profile_URL IMAGE EXIST ', imageExists)

      } else {
        this.USER_PHOTO_PROFILE_EXIST = false;
        this.logger.log('[SIDEBAR-USER-DETAILS] photo_profile_URL IMAGE EXIST ', imageExists)
      }
    })
  }


  verifyImageURL(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }

  // listenOpenUserSidebarEvent() {
  //   this.events.subscribe('userdetailsidebar:opened', (openUserDetailsSidebar) => {
  //     this.logger.log('[SIDEBAR-USER-DETAILS] - listenOpenUserSidebarEvent - openUserDetailsSidebar', openUserDetailsSidebar);
  //   this.HAS_CLICKED_OPEN_USER_DETAIL = true;
  //   });
  // }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    this.logger.log('[SIDEBAR-USER-DETAILSS-CHAT] clickout event.target)', event.target)
    this.logger.log('[SIDEBAR-USER-DETAILSS-CHAT] clickout event.target)', event.target.id)
    const clicked_element_id = event.target.id
    if (this.eRef.nativeElement.contains(event.target)) {
      // this.logger.log('[SIDEBAR-USER-DETAILS] clicked inside')
    } else {
      if (!clicked_element_id.startsWith("sidebaravatar")) {
        this.closeUserDetailSidePanel();
      }
      // this.logger.log('[SIDEBAR-USER-DETAILS] clicked outside')

    }
  }

  closeUserDetailSidePanel() {
    var element = document.getElementById('user-details');
    element.classList.remove("active");
    this.logger.log('[SIDEBAR-USER-DETAILS] element', element);
    // this.HAS_CLICKED_OPEN_USER_DETAIL === true
    // this.onCloseUserDetailsSidebar.emit(false);
  }


  getCurrentChatLangAndTranslateLabels(currentUser) {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[SIDEBAR-USER-DETAILS] - ngOnInit - currentUser ', currentUser)
    this.logger.log('[SIDEBAR-USER-DETAILS] - ngOnInit - browserLang ', this.browserLang)

    const stored_preferred_lang = localStorage.getItem(currentUser.uid + '_lang');
    this.logger.log('[SIDEBAR-USER-DETAILS] stored_preferred_lang: ', stored_preferred_lang);


    this.chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      this.chat_lang = this.browserLang
      // this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"

      this.logger.log('[SIDEBAR-USER-DETAILS] flag_url: ', this.flag_url);
      this.logger.log('[SIDEBAR-USER-DETAILS] chat_lang: ', this.chat_lang);
    } else if (this.browserLang && stored_preferred_lang) {
      this.chat_lang = stored_preferred_lang
      // this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"
      this.logger.log('[SIDEBAR-USER-DETAILS] flag_url: ', this.flag_url);
      this.logger.log('[SIDEBAR-USER-DETAILS] chat_lang: ', this.chat_lang);
    }

    if (tranlatedLanguage.includes(this.chat_lang)) {
      this.logger.log('[SIDEBAR-USER-DETAILS] tranlatedLanguage includes', this.chat_lang, ': ', tranlatedLanguage.includes(this.chat_lang))
      this.translate.use(this.chat_lang);
      this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"
    } else {
      this.logger.log('[SIDEBAR-USER-DETAILS] tranlatedLanguage includes', this.chat_lang, ': ', tranlatedLanguage.includes(this.chat_lang))
      this.translate.use('en');
      this.flag_url = "assets/images/language_flag/en.png"
      this.chat_lang = 'en'
    }

    this.translateLabels()
  }

  translateLabels() {
    let keys= [
      'EditProfile',
      'Available',
      'Unavailable',
      'Busy',
      'LABEL_LOGOUT',
      'SubscriptionPaymentProblem',
      'ThePlanHasExpired'
    ]

    this.translate.get(keys).subscribe((text: string) => {
      this.EditProfileLabel = text['EditProfile'];
      this.IS_AVAILABLE_msg = text['Available']
      this.IS_UNAVAILABLE_msg = text['Unavailable']
      this.IS_BUSY_msg = text['Busy']
      this.LOGOUT_msg = text['LABEL_LOGOUT']
      this.SUBSCRIPTION_PAYMENT_PROBLEM_msg = text['SubscriptionPaymentProblem']
      this.THE_PLAN_HAS_EXPIRED_msg = text['ThePlanHasExpired']
      
    });
  }


  getOSCODE() {
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[SIDEBAR-USER-DETAILS] AppConfigService getAppConfig public_Key', this.public_Key);
    this.logger.log('[SIDEBAR-USER-DETAILS] AppConfigService getAppConfig', this.appConfigProvider.getConfig());
    if (this.public_Key) {
      let keys = this.public_Key.split("-");
      this.logger.log('[SIDEBAR-USER-DETAILS] PUBLIC-KEY - public_Key keys', keys)

      keys.forEach(key => {
        if (key.includes("PAY")) {

          let pay = key.split(":");

          if (pay[1] === "F") {
            this.isVisiblePAY = false;
          } else {
            this.isVisiblePAY = true;
          }
        }
      });

      if (!this.public_Key.includes("PAY")) {
        this.isVisiblePAY = false;
      }
    } else {
      this.isVisiblePAY = false;
    }
  }

  getEditProfileTranslation() {
    this.translate.get('EditProfile').subscribe((text: string) => {
        this.EditProfileLabel = text
      });
  }

  getAvailableTranslation() {
    this.translate.get('Available').subscribe((text: string) => {
        this.IS_AVAILABLE_msg = text
    });
  }
  getUnavailableTranslation() {
    this.translate.get('Unavailable').subscribe((text: string) => {
        this.IS_UNAVAILABLE_msg = text
    });
  }

  getIsBusyTranslation() {
    this.translate.get('Busy').subscribe((text: string) => {
        this.IS_BUSY_msg = text
    });
  }

  getLogoutTranslation() {
    this.translate.get('LABEL_LOGOUT').subscribe((text: string) => {
        this.LOGOUT_msg = text
    });
  }

  getSubscriptionPaymentProblemTranslation() {
    this.translate.get('SubscriptionPaymentProblem').subscribe((text: string) => {
        this.SUBSCRIPTION_PAYMENT_PROBLEM_msg = text
    });
  }

  getThePlanHasExpiredTranslation() {
    this.translate.get('ThePlanHasExpired').subscribe((text: string) => {
        this.THE_PLAN_HAS_EXPIRED_msg = text
    });
  }


  listenToCurrentStoredProject() {
    this.events.subscribe('storage:last_project', project => {
      if (project && project !== 'undefined') {
        const projectObjct = JSON.parse(project)
        // console.log('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT ', projectObjct)

        this.project = {
          _id: projectObjct['id_project']['_id'],
          name: projectObjct['id_project']['name'],
          type: projectObjct['id_project']['profile']['type'],
          isActiveSubscription: projectObjct['id_project']['isActiveSubscription'],
          plan_name: projectObjct['id_project']['profile']['name']
        }

        const trial_expired = projectObjct['id_project']['trialExpired']    
        const profile_name = projectObjct['id_project']['profile']['name'];
      
        if (this.project.type === 'free') {

          if (trial_expired === false) {
            this.getProPlanTrialTranslation();
          } else if (trial_expired === true) {
            this.getFreePlanTranslation();
          }
        } else if (this.project.type === 'payment' && profile_name === 'pro') {
          this.getProPlanTranslation();
        } else if (this.project.type === 'payment' && profile_name === 'enterprise') {
          this.getEnterprisePlanTranslation();
        }
      }
    })

    try {
      this.tiledeskToken = this.appStorageService.getItem('tiledeskToken');
      // console.log('[SIDEBAR-USER-DETAILS] - GET STORED TOKEN ', this.tiledeskToken)
    } catch (err) {
      this.logger.error('[SIDEBAR-USER-DETAILS] - GET STORED TOKEN ', err)
    }
  }


  getProPlanTrialTranslation() {
    this.translate.get('ProPlanTrial').subscribe((text: string) => {
        this.profile_name_translated = text
      });
  }

  getFreePlanTranslation() {
    this.translate.get('FreePlan').subscribe((text: string) => {
        this.profile_name_translated = text
      });
  }

  getProPlanTranslation() {
    this.translate.get('PaydPlanNamePro').subscribe((text: string) => {
        this.profile_name_translated = text
      });
  }

  getEnterprisePlanTranslation() {
    this.translate.get('PaydPlanNameEnterprise').subscribe((text: string) => {
        this.profile_name_translated = text
      });
  }

  listenTocurrentProjectUserUserAvailability$() {
    this.wsService.currentProjectUserAvailability$.pipe(skip(1)).subscribe((projectUser) => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', projectUser);

        if (projectUser) {
          this.IS_AVAILABLE = projectUser['user_available']
          this.IS_BUSY = projectUser['isBusy']
          this.USER_ROLE = projectUser['role']
          this.translateUserRole(this.USER_ROLE)
        }

      }, (error) => {
        this.logger.error('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
      }, () => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
      })
  }

  translateUserRole(role) {
    this.translate.get(role).subscribe((text: string) => {
        this.USER_ROLE_LABEL = text
      });
  }


  ngOnChanges() {  }





  changeAvailabilityStateInUserDetailsSidebar(available) {
    this.logger.log('[SIDEBAR-USER-DETAILS] - changeAvailabilityState projectid', this.project._id, ' available 1: ', available);

    this.wsService.updateCurrentUserAvailability(this.tiledeskToken, this.project._id, available)
      .subscribe((projectUser: any) => {

        this.logger.log('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED ', projectUser)

      }, (error) => {
        this.logger.error('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED - ERROR  ', error);

      }, () => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED  * COMPLETE *');

      });
  }

  goToUserProfile() {
    let url = this.DASHBOARD_URL + this.project._id + '/user-profile'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToHelpCenter() {
    const url = "https://gethelp.tiledesk.com/"
    window.open(url, '_blank');
  }

  public onLogout() {
    this.closeUserDetailSidePanel()
    this.events.publish('profileInfoButtonClick:logout', true);
  }


}
