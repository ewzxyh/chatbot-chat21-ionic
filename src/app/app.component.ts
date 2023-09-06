import { Component, HostListener, NgZone, OnInit, ViewChild } from '@angular/core';

import { AlertController, Config, IonNav, IonRouterOutlet, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Subscription } from 'rxjs';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { WebSocketJs } from './services/websocket/websocket-js';
import { checkPlatformIsMobile, getParameterByName, isOnMobileDevice } from 'src/chat21-core/utils/utils';
import { EventsService } from './services/events-service';
import { NavProxyService } from './services/nav-proxy.service';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { AppConfigProvider } from './services/app-config';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { environment } from 'src/environments/environment';
import { ChatManager } from 'src/chat21-core/providers/chat-manager';
import { TranslateService } from '@ngx-translate/core';
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
import { TypingService } from 'src/chat21-core/providers/abstract/typing.service';
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { NotificationsService } from 'src/chat21-core/providers/abstract/notifications.service';
import { NetworkService } from './services/network-service/network.service';
import { ScriptService } from './services/scripts/script.service';
import { AUTH_STATE_OFFLINE, AUTH_STATE_ONLINE, PLATFORM_DESKTOP, PLATFORM_MOBILE, tranlatedLanguage, TYPE_DIRECT, URL_SOUND_CONVERSATION_ADDED, URL_SOUND_CONVERSATION_UNASSIGNED, URL_SOUND_LIST_CONVERSATION } from 'src/chat21-core/utils/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { LoginPage } from './pages/authentication/login/login.page';
import { UserModel } from 'src/chat21-core/models/user';
import { filter } from 'rxjs/operators';
import { ConversationListPage } from './pages/conversations-list/conversations-list.page';
import { Location } from '@angular/common'
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx'
import { Deeplinks } from '@ionic-native/deeplinks/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('sidebarNav', { static: false }) sidebarNav: IonNav;
  @ViewChild('detailNav', { static: false }) detailNav: IonRouterOutlet;

  // public appIsOnline$: Observable<boolean> = undefined;
  checkInternet: boolean;

  private BSAuthStateChangedSubscriptionRef: Subscription;
  public sidebarPage: any;
  public notificationsEnabled: boolean;
  public zone: NgZone;
  public platformIs: string;
  private doitResize: any;
  private timeModalLogin: any;
  public tenant: string;
  public persistence: string;
  public authModal: any;

  private audio: any;
  private audio_NewConv: any;
  private audio_Unassigned: any;
  private setIntervalTime: any;
  private setTimeoutSound: any;
  private isTabVisible: boolean = true;
  public isSoundEnabled: boolean;
  private hasPlayed: boolean;
  private hasPlayedConversation: boolean;
  private hasPlayedConversationUnassigned: boolean;
  private tabTitle: string;
  private setTimeoutConversationsEvent: any;
  private logger: LoggerService = LoggerInstance.getInstance();
  public toastMsgErrorWhileUnsubscribingFromNotifications: string;
  public toastMsgCloseToast: string;
  public toastMsgWaitingForNetwork: string;
  private modalOpen: boolean = false;
  private hadBeenCalledOpenModal: boolean = false;
  public missingConnectionToast: any
  public executedInitializeAppByWatchConnection: boolean = false;
  private isInitialized: boolean = false;
  private version: string;
  public lang: string; 
  IS_ONLINE: boolean;
  IS_ON_MOBILE_DEVICE: boolean = true
  SUPPORT_MODE: boolean;
  // private isOnline: boolean = false;

  wsService: WebSocketJs;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private deeplinks: Deeplinks,
    private appConfigProvider: AppConfigProvider,
    public events: EventsService,
    public config: Config,
    public chatManager: ChatManager,
    public translate: TranslateService,
    public alertController: AlertController,
    public navCtrl: NavController,
    // public userService: UserService,
    // public currentUserService: CurrentUserService,
    public modalController: ModalController,
    public messagingAuthService: MessagingAuthService,
    public tiledeskAuthService: TiledeskAuthService,
    public presenceService: PresenceService,
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavProxyService,
    // public chatPresenceHandler: ChatPresenceHandler,
    public typingService: TypingService,
    public uploadService: UploadService,
    public appStorageService: AppStorageService,

    // public chatConversationsHandler: ChatConversationsHandler,
    public conversationsHandlerService: ConversationsHandlerService,
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    private translateService: CustomTranslateService,
    public notificationsService: NotificationsService,
    public toastController: ToastController,
    // private network: Network,
    // private tiledeskService: TiledeskService,
    private networkService: NetworkService,
    public webSocketJs: WebSocketJs,
    public scriptService: ScriptService,
    public location: Location,
    public fcm: FCM
  ) {

    this.saveInStorageNumberOfOpenedChatTab();
    this.listenChatAlreadyOpenWithoutParamsInMobileMode()
    this.IS_ON_MOBILE_DEVICE = isOnMobileDevice()
  }

  saveInStorageNumberOfOpenedChatTab() {
    // this.logger.log('Calling saveInStorageChatOpenedTab!');
    // https://jsfiddle.net/jjjs5wd3/3/å
    if (+localStorage.tabCount > 0) {
      this.logger.log('Chat IONIC Already open!');
    } else {
      localStorage.tabCount = 0;

      localStorage.tabCount = +localStorage.tabCount + 1;
    }
    const terminationEvent = 'onpagehide' in self ? 'pagehide' : 'unload';
    window.addEventListener(terminationEvent, (event) => {
      if (localStorage.tabCount > 0) {
        localStorage.tabCount = +localStorage.tabCount - 1;
      }
    }, { capture: true });
  }

  listenChatAlreadyOpenWithoutParamsInMobileMode() {
    this.events.subscribe('noparams:mobile', (isAlreadyOpenInMobileMode) => {
      // console.log('[APP-COMP] Chat is Already Open In Mobile Mode ', isAlreadyOpenInMobileMode)
      if (isAlreadyOpenInMobileMode === true) {
        this.checkPlatform()
      }
    });
  }

  // listenToUrlChanges() {
  //   const self = this;
  //   // window.addEventListener('hashchange', function () {
  //   window.addEventListener('locationchange', function () {

  //     console.log('location changed!');

  //     const convId = getParameterByName('convId')
  //     console.log('[APP-COMP] getParameterByName convId ', convId)
  //     if (convId) {
  //       setTimeout(() => {
  //         self.events.publish('supportconvid:haschanged', convId);
  //       }, 0);
  //     }

  //     const contact_id = getParameterByName('contact_id')
  //     console.log('[APP-COMP] getParameterByName contact_id ', contact_id)
  //     const contact_fullname = getParameterByName('contact_fullname')
  //     console.log('[APP-COMP] getParameterByName contact_fullname ', contact_fullname)
  //     if (contact_id && contact_fullname) {
  //       setTimeout(() => {
  //         self.router.navigateByUrl('conversation-detail/' + contact_id + '/' + contact_fullname + '/new');
  //         self.events.publish('directconvid:haschanged', contact_id);
  //       }, 0);

  //     } else {
  //       // console.log('[APP-COMP] contact_id and contact_fullname are null')
  //     }

  //     const conversation_detail = getParameterByName('conversation_detail')
  //     // console.log('[APP-COMP] getParameterByName conversation_detail ', conversation_detail)
  //     if (conversation_detail) {
  //       setTimeout(() => {
  //         self.router.navigate(['conversation-detail/'])
  //       }, 0);
  //     }
  //   });
  // }

  // getPageState() {
  //   const getState = () => {

  //     console.log('[APP-COMP] getState')
  //     // localStorage.setItem('visibilityState', document.visibilityState)
  //     if (document.visibilityState === 'hidden') {
  //       return 'hidden';
  //     }
  //     if (document.hasFocus()) {
  //       return 'active';
  //     }
  //     return 'passive';
  //   };

  //   let state = getState();

  //   const logStateChange = (nextState) => {

  //     const prevState = state;
  //     if (nextState !== prevState) {
  //       console.log(`State change: ${prevState} >>> ${nextState}`);
  //       state = nextState;

  //     }
  //   };

  //   ['pageshow', 'focus', 'blur', 'visibilitychange', 'resume'].forEach((type) => {
  //     window.addEventListener(type, () => logStateChange(getState()), { capture: true });
  //   });

  //   // The next two listeners, on the other hand, can determine the next
  //   // state from the event itself.
  //   window.addEventListener('freeze', () => {
  //     // In the freeze event, the next state is always frozen.
  //     logStateChange('frozen');
  //   }, { capture: true });

  //   window.addEventListener('pagehide', (event) => {
  //     if (event.persisted) {
  //       // If the event's persisted property is `true` the page is about
  //       // to enter the Back-Forward Cache, which is also in the frozen state.
  //       logStateChange('frozen');
  //       localStorage.setItem('state', 'frozen')
  //     } else {
  //       // If the event's persisted property is not `true` the page is
  //       // about to be unloaded.
  //       logStateChange('terminated');
  //       localStorage.setItem('state', 'terminated')
  //       localStorage.setItem('terminated', 'true')
  //     }
  //   }, { capture: true });

  // }


  ngOnInit(): void {
    const appconfig = this.appConfigProvider.getConfig();
    this.logger.log('[APP-COMP] ngOnInit  appconfig', appconfig)
    if (appconfig && appconfig.supportMode && (appconfig.supportMode === true || appconfig.supportMode === 'true')) {
      this.SUPPORT_MODE = true;
      this.logger.log('[APP-COMP] appconfig > SUPPORT_MODE', this.SUPPORT_MODE)
    } else {
      this.SUPPORT_MODE = false;
      this.logger.log('[APP-COMP] appconfig > SUPPORT_MODE', this.SUPPORT_MODE)
    }
    this.persistence = appconfig.authPersistence;
    this.appStorageService.initialize(environment.storage_prefix, this.persistence, '')
    // this.logger.log('[APP-COMP] HELLO ngOnInit !!!!!!!')
    // this.logger.log('[APP-COMP] ngOnInit this.route.snapshot.params -->', this.route.snapshot.params);
    // this.initializeApp('oninit');
    const token = getParameterByName('jwt')
    // this.logger.log('[APP-COMP] ngOnInit AUTOLOGIN token get with getParameterByName -->', token);
    if (token) {
      // this.isOnline = false;
      // this.logger.log('[APP-COMP] ngOnInit AUTOLOGIN token get with this.isOnline  ', this.isOnline)
      this.logger.log('[APP-COMP] ngOnInit AUTOLOGIN token get with getParameterByName  ', token)
      // save token in local storage then 

      const storedToken = this.appStorageService.getItem('tiledeskToken');
      this.logger.log('[APP-COMP] ngOnInit AUTOLOGIN storedToken ', storedToken)
      this.logger.log('[APP-COMP] ngOnInit AUTOLOGIN SAVE THE PARAMS TOKEN ', token)
      if (storedToken !== token) {
        this.appStorageService.setItem('tiledeskToken', token);
      } else {
        this.logger.log('[APP-COMP] ngOnInit AUTOLOGIN the current user already exist DON\'T SAVE ')
      }
    }


    this.initializeApp('oninit');
    this.loadCustomScript(appconfig)
    this.listenToPostMsgs();
  }


  listenToPostMsgs() {
    window.addEventListener("message", (event) => {
      this.logger.log("[APP-COMP] message event ", event);

      if (event && event.data && event.data.action && event.data.parameter) {
        if (event.data.action === 'openJoinConversationModal') {
          this.presentAlertConfirmJoinRequest(event.data.parameter, event.data.calledBy)
        }
      }
      // if (event && event.data && event.data.action && event.data.parameter) {
      //   if (event.data.action === 'hasArchived') {
      //     var iframeWin = <HTMLIFrameElement>document.getElementById("unassigned-convs-iframe")
      //     const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
      //     input !== null && input.tagName === 'IFRAME';
      //     if (isIFrame(iframeWin) && iframeWin.contentWindow) {
      //       const msg = { action: "hasArchived", parameter: event.data.parameter, calledBy: event.data.calledBy }
      //       iframeWin.contentWindow.postMessage(msg, '*');
      //     }

      //   }
      // }
      if (event && event.data && event.data.action && event.data.text) {
        if (event.data.action === "display_toast_join_complete") {
          this.presentToastJoinComplete(event.data.text)
        }
      }

      if (event && event.data && event.data.action && event.data.parameter) {
        if (event.data.action === "presenceUser") {
          this.events.publish('presenceUser', event.data.parameter)
        }
      }
    })
  }

  async presentToastJoinComplete(text) {
    const toast = await this.toastController.create({
      message: text,
      duration: 2000,
      color: "success"
    });
    toast.present();
  }

  async presentAlertConfirmJoinRequest(requestid, calledby) {
    var iframeWin = <HTMLIFrameElement>document.getElementById("unassigned-convs-iframe")

    const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
      input !== null && input.tagName === 'IFRAME';

    const keys = ['YouAreAboutToJoinThisChat', 'Cancel', 'AreYouSure'];
    const translationMap = this.translateService.translateLanguage(keys);

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: translationMap.get('AreYouSure'),
      message: translationMap.get('YouAreAboutToJoinThisChat'),
      buttons: [
        {
          text: translationMap.get('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Ok',
          handler: () => {

            if (isIFrame(iframeWin) && iframeWin.contentWindow) {
              const msg = { action: "joinConversation", parameter: requestid, calledBy: calledby }
              iframeWin.contentWindow.postMessage(msg, '*');
            }
          }
        }
      ]
    });

    await alert.present();
  }




  signInWithCustomToken(token) {
    // this.isOnline = false;
    this.logger.log('[APP-COMP] SIGNINWITHCUSTOMTOKEN  token', token)
    this.tiledeskAuthService.signInWithCustomToken(token).then((user: any) => {
        this.logger.log('[APP-COMP] SIGNINWITHCUSTOMTOKEN AUTLOGIN user', user)
        this.messagingAuthService.createCustomToken(token)
    }).catch(error => {
        this.logger.error('[APP-COMP] SIGNINWITHCUSTOMTOKEN error::', error)
    })
  }

  initializeApp(calledby: string) {

    if (!this.platform.is('desktop')) {
      this.splashScreen.show();
    }
    this.tabTitle = document.title;

    this.getRouteParamsAndSetLoggerConfig();

    const appconfig = this.appConfigProvider.getConfig();
    // this.logger.info('[APP-COMP] appconfig: ', appconfig)
    this.version = environment.version;
    this.logger.info('[APP-COMP] version: ', this.version)

    this.logger.setLoggerConfig(true, appconfig.logLevel)
    this.logger.info('[APP-COMP] logLevel: ', appconfig.logLevel);

    this.tenant = appconfig.firebaseConfig.tenant;
    this.logger.info('[APP-COMP] appconfig firebaseConfig tenant: ', this.tenant);
    this.notificationsEnabled = true;
    this.zone = new NgZone({}); // a cosa serve?

    this.platform.ready().then(() => {
      let platform = this.getPlatformName();

      this.initDeeplinks();
      // this.setLanguage();

      if (this.splashScreen) {
        this.splashScreen.hide();
      }
      this.statusBar.styleLightContent();
      this.navService.init(this.sidebarNav, this.detailNav);
      this.tiledeskAuthService.initialize(this.appConfigProvider.getConfig().apiUrl);
      this.messagingAuthService.initialize();

      // this.currentUserService.initialize();
      this.chatManager.initialize();
      this.presenceService.initialize(this.tenant);
      this.typingService.initialize(this.tenant);

      const pushEngine = this.appConfigProvider.getConfig().pushEngine
      const vap_id_Key = this.appConfigProvider.getConfig().firebaseConfig.vapidKey

      if (pushEngine && pushEngine !== 'none') {
        this.notificationsService.initialize(this.tenant, vap_id_Key, platform)
      }
      this.uploadService.initialize();

      this.setLanguage(null)
      this.initAuthentication();
      this.initSubscriptions();
      this.initAudio();

      this.logger.debug('[APP-COMP] initializeApp:: ', this.sidebarNav, this.detailNav);

      this.translateToastMsgs();

      // ---------------------------------------
      // Watch to network status
      // ---------------------------------------
      this.watchToConnectionStatus();


    });
  }

  getPlatformName(): string {
    let platform: string = ''
    if (this.platform.is('cordova')) {
      this.logger.log("the device running Cordova");
    }
    if (!this.platform.is('cordova')) {
      this.logger.log("the device Not running Cordova");
    }

    if (this.platform.is('android')) {
      this.logger.log("running on Android device!");
      platform = 'android'
    }
    if (this.platform.is('ios')) {
      this.logger.log("running on iOS device!");
      platform = 'ios'
    }
    if (this.platform.is('mobileweb')) {
      this.logger.log("running in a browser on mobile!");
      platform = 'mobileweb'
    }
    if (this.platform.is('desktop')) {
      this.logger.log("running on desktop!");
      platform = 'desktop'
    }

    return platform
  }

  getRouteParamsAndSetLoggerConfig() {
    const appconfig = this.appConfigProvider.getConfig();
    this.route.queryParams.subscribe(params => {
      // this.logger.log('[APP-COMP] getRouteParamsAndSetLoggerConfig - queryParams params: ', params)
      if (params.logLevel) {
        this.logger.log('[APP-COMP] getRouteParamsAndSetLoggerConfig - log level get from queryParams: ', params.logLevel)
        this.logger.setLoggerConfig(true, params.logLevel)
      } else {
        this.logger.info('[APP-COMP] getRouteParamsAndSetLoggerConfig - log level get from appconfig: ', appconfig.logLevel)
        this.logger.setLoggerConfig(true, appconfig.logLevel)
      }
    });
  }

  initDeeplinks(){
    this.deeplinks.route({'/conversation-detail': ConversationListPage}).subscribe(match => {
      this.logger.log('[APP-COMP] deeplinks match route', JSON.stringify(match.$args))
      if(match.$args && match.$args.jwt){
        this.appStorageService.setItem('tiledeskToken', decodeURIComponent(match.$args.jwt))
        this.initAuthentication()
      }
    }, (nomatch)=> {
      this.logger.error("[APP-COMP] deeplinks: Got a deeplink that didn't match", nomatch);
    })
  }

  /** */
  setLanguage(currentUser) {
    // const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
    this.logger.log('[APP-COMP] - setLanguage current_user uid: ', currentUser);

    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid;
      this.logger.log('[APP-COMP] - setLanguage current_user uid: ', currentUserId);
    }
    // this.translate.setDefaultLang('en');
    //   this.translate.use('en');

    const browserLang = this.translate.getBrowserLang();
    this.logger.log('[APP-COMP] browserLang: ', browserLang);
    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    this.logger.log('[APP-COMP] stored_preferred_lang: ', stored_preferred_lang);

    let chat_lang = ''
    if (browserLang && !stored_preferred_lang) {
      chat_lang = browserLang
    } else if (browserLang && stored_preferred_lang) {
      chat_lang = stored_preferred_lang
    }

    if (tranlatedLanguage.includes(chat_lang)) {
      this.logger.log('[APP-COMP] tranlatedLanguage includes', chat_lang, ': ', tranlatedLanguage.includes(chat_lang))
      this.translate.setDefaultLang(chat_lang)
      this.translate.use(chat_lang);
    }
    else {
      this.logger.log('[APP-COMP] tranlatedLanguage not includes', chat_lang, ': ', tranlatedLanguage.includes(chat_lang))
      chat_lang = 'en'
      this.translate.setDefaultLang('en');
      this.translate.use('en');
    }
    this.lang=chat_lang

  }


  watchToConnectionStatus() {
    this.networkService.checkInternetFunc().subscribe(isOnline => {
      this.checkInternet = isOnline
      this.logger.log('[APP-COMP] - watchToConnectionStatus - isOnline', this.checkInternet)

      // checking internet connection
      if (this.checkInternet == true) {
        // this.events.publish('internetisonline', true);
        // show success alert if internet is working
        // alert('Internet is working.')
        this.logger.log('[APP-COMP] - watchToConnectionStatus - Internet is working.')
        // this.logger.log('[APP-COMP] - watchToConnectionStatus - this.missingConnectionToast', this.missingConnectionToast)
        if (!checkPlatformIsMobile()) {
          const elemIonNav = <HTMLElement>document.querySelector('ion-nav');
          this.logger.log('[APP-COMP] - watchToConnectionStatus - desktop * elemIonNav *', elemIonNav)

          if (this.executedInitializeAppByWatchConnection === false) {
            setTimeout(() => {
              const elemIonNavchildNodes = elemIonNav.childNodes;
              this.logger.log('[APP-COMP] - watchToConnectionStatus - elemIonNavchildNodes ', elemIonNavchildNodes);

              if (elemIonNavchildNodes.length === 0) {
                this.logger.log('[APP-COMP] - watchToConnectionStatus - elemIonNavchildNodes  HERE YES', elemIonNavchildNodes);

                // this.initializeApp('checkinternet');
                this.executedInitializeAppByWatchConnection = true;
              }
            }, 2000);
          }
        } else if (checkPlatformIsMobile()) {
          this.logger.log('[APP-COMP] - watchToConnectionStatus - mobile ')
          const elemIonRouterOutlet = <HTMLElement>document.querySelector('ion-router-outlet');
          this.logger.log('[APP-COMP] - watchToConnectionStatus - mobile * elemIonRouterOutlet *', elemIonRouterOutlet)
          if (this.executedInitializeAppByWatchConnection === false) {
            setTimeout(() => {
              const childElementCount = elemIonRouterOutlet.childElementCount;
              this.logger.log('[APP-COMP] - watchToConnectionStatus - mobile * childElementCount *', childElementCount)
              if (childElementCount === 1) {
                // this.initializeApp('checkinternet');
                this.executedInitializeAppByWatchConnection = true;
              }
            }, 2000);
          }
        }
      }
      else {
        this.logger.log('[APP-COMP] - watchToConnectionStatus - Internet is slow or not working.');
      }
    });
  }


  translateToastMsgs() {
    this.translate.get('AnErrorOccurredWhileUnsubscribingFromNotifications').subscribe((text: string) => {
        this.toastMsgErrorWhileUnsubscribingFromNotifications = text;
      });
    this.translate.get('CLOSE_TOAST').subscribe((text: string) => {
        this.toastMsgCloseToast = text;
      });
    this.translate.get('WAITING_FOR_NETWORK').subscribe((text: string) => {
        this.toastMsgWaitingForNetwork = text;
      });
  }


  updateStoredCurrentUser() {
    const storedCurrentUser = this.appStorageService.getItem('currentUser')
    const storedDshbrdUser = localStorage.getItem('user')
    this.logger.log('[APP-COMP] updateStoredCurrentUser - stored currentUser', storedCurrentUser)
    this.logger.log('[APP-COMP] updateStoredCurrentUser - stored dshbrdUser', storedDshbrdUser)
    if ((storedCurrentUser && storedCurrentUser !== 'undefined') && (storedDshbrdUser && storedDshbrdUser !== 'undefined')) {
      const currentUser = JSON.parse(storedCurrentUser);
      const dshbrdUser = JSON.parse(storedDshbrdUser);
      if (currentUser && dshbrdUser) {
        if (currentUser.color !== dshbrdUser.fillColour) {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.color !== dshbrdUser.fillColour')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.color ', currentUser.color)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.fillColour ', dshbrdUser.fillColour)
          currentUser.color = dshbrdUser.fillColour;
        } else {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.color === dshbrdUser.fillColour')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.color ', currentUser.color)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.fillColour ', dshbrdUser.fillColour)
        }
        if (currentUser.firstname !== dshbrdUser.firstname) {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.firstname !== dshbrdUser.firstname')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.firstname ', currentUser.firstname)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.firstname ', dshbrdUser.firstname)
          currentUser.firstname = dshbrdUser.firstname;
        } else {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.firstname === dshbrdUser.firstname')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.firstname ', currentUser.firstname)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.firstname ', dshbrdUser.firstname)
        }
        if (currentUser.lastname !== dshbrdUser.lastname) {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.lastname !== dshbrdUser.lastname')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.lastname ', currentUser.lastname)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.lastname ', dshbrdUser.lastname)
          currentUser.lastname = dshbrdUser.lastname;
        } else {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.lastname === dshbrdUser.lastname')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.lastname ', currentUser.lastname)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.lastname ', dshbrdUser.lastname)
        }
        if (currentUser.avatar !== dshbrdUser.fullname_initial) {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.avatar !== dshbrdUser.fullname_initial')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.avatar ', currentUser.avatar)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.fullname_initial ', dshbrdUser.fullname_initial)
          currentUser.avatar = dshbrdUser.fullname_initial
        } else {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.avatar === dshbrdUser.fullname_initial')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.avatar ', currentUser.avatar)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.fullname_initial ', dshbrdUser.fullname_initial)
        }
        let fullname = ""
        if (dshbrdUser.firstname && !dshbrdUser.lastname) {
          fullname = dshbrdUser.firstname
        } else if (dshbrdUser.firstname && dshbrdUser.lastname) {
          fullname = dshbrdUser.firstname + ' ' + dshbrdUser.lastname
          this.logger.log('[APP-COMP] updateStoredCurrentUser - fullname ', fullname)
        }
        if (fullname !== currentUser.fullname) {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.fullname !== dshbrdUser.fullname ')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.fullname  ', fullname)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.fullname ', currentUser.fullname)
          currentUser.fullname = fullname
        } else {
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.fullname === dshbrdUser.fullname ')
          this.logger.log('[APP-COMP] updateStoredCurrentUser - currentUser.fullname  ', fullname)
          this.logger.log('[APP-COMP] updateStoredCurrentUser - dshbrdUser.fullname ', currentUser.fullname)
        }
        this.appStorageService.setItem('currentUser', JSON.stringify(currentUser));
        this.tiledeskAuthService.setCurrentUser(currentUser);
      }
    } else {
      this.logger.error('[APP-COMP] updateStoredCurrentUser - currentuser or dashboarduser not found in storage')
    }
  }

  /***************************************************+*/
  /**------- AUTHENTICATION FUNCTIONS --> START <--- +*/
  private initAuthentication() {
    const tiledeskToken = this.appStorageService.getItem('tiledeskToken')

    this.logger.log('[APP-COMP] >>> INIT-AUTHENTICATION !!! ')
    this.logger.log('[APP-COMP] >>> initAuthentication tiledeskToken ', tiledeskToken)
    // const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
    // this.logger.log('[APP-COMP] >>> initAuthentication currentUser ', currentUser)
    if (tiledeskToken) {
      this.logger.log('[APP-COMP] >>> initAuthentication I LOG IN WITH A TOKEN EXISTING IN THE LOCAL STORAGE OR WITH A TOKEN PASSED IN THE URL PARAMETERS <<<')
      this.tiledeskAuthService.signInWithCustomToken(tiledeskToken).then(user => {
        this.logger.log('[APP-COMP] >>> initAuthentication user ', user)

        this.updateStoredCurrentUser()

        this.messagingAuthService.createCustomToken(tiledeskToken)
      }).catch(error => {
        this.logger.error('[APP-COMP] initAuthentication SIGNINWITHCUSTOMTOKEN error::', error)
      })
    } else {
      this.logger.warn('[APP-COMP] >>> I AM NOT LOGGED IN <<<')
      this.IS_ONLINE = false;

      if (!this.hadBeenCalledOpenModal) {
        this.authModal = this.presentModal('initAuthentication');
        this.hadBeenCalledOpenModal = true;
      }

      if(this.IS_ON_MOBILE_DEVICE){
        clearTimeout(this.timeModalLogin);
        this.timeModalLogin = setTimeout(() => {
          if (!this.hadBeenCalledOpenModal) {
            this.authModal = this.presentModal('initAuthentication');
            this.hadBeenCalledOpenModal = true;
          }
        }, 1000)
      }else{
        this.goToDashboardLogin()
      }
    }
  }

  // checkTokenAndGoOffline() {
  //   let token = this.appStorageService.getItem('tiledeskToken');
  //   this.logger.info('[APP-COMP] ***** checkTokenAndGoOffline - stored token *****', token);
  //   if (!token) {
  //     this.goOffLine()
  //   }
  // }


  /**------- AUTHENTICATION FUNCTIONS --> END <--- +*/
  /***************************************************+*/

  checkPlatform() {
    if (checkPlatformIsMobile()) {
      this.chatManager.startApp();

      this.logger.log('[APP-COMP] checkPlatformIsMobile', checkPlatformIsMobile());
      this.platformIs = PLATFORM_MOBILE;
      this.logger.log('[APP-COMP] this.platformIs', this.platformIs);
      let IDConv= null
      if(this.route &&  this.route.snapshot && this.route.snapshot.firstChild){
        IDConv = this.route.snapshot.firstChild.paramMap.get('IDConv');
      }

      // console.log('[APP-COMP] PLATFORM', PLATFORM_MOBILE, 'route.snapshot', this.route.snapshot);
      if (!IDConv) {
        this.logger.log('[APP-COMP]  navigateByUrl -- conversations-list');
        this.router.navigateByUrl('conversations-list')
      }
      // this.router.navigateByUrl(pageUrl);
      // this.navService.setRoot(ConversationListPage, {});
    } else {
      this.chatManager.startApp();
      this.logger.log('[APP-COMP] checkPlatformIsMobile', checkPlatformIsMobile());
      this.platformIs = PLATFORM_DESKTOP;
      this.logger.log('[APP-COMP]  platformIs', this.platformIs);
      // console.log('[APP-COMP] PLATFORM', PLATFORM_DESKTOP, 'route.snapshot',  this.route.snapshot);
      this.logger.log('[APP-COMP] PLATFORM_DESKTOP ', this.navService);

      this.navService.setRoot(ConversationListPage, {});

      const IDConv = this.route.snapshot.firstChild.paramMap.get('IDConv');

      const FullNameConv = this.route.snapshot.firstChild.paramMap.get('FullNameConv');
      const Convtype = this.route.snapshot.firstChild.paramMap.get('Convtype');


      let pageUrl = 'conversation-detail/'
      if (IDConv && FullNameConv) {
        pageUrl += IDConv + '/' + FullNameConv + '/' + Convtype
      }
      // replace(/\(/g, '%28').replace(/\)/g, '%29') -> used for the encoder of any round brackets
      this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29').replace( /#/g, "%23" ));


      // const DASHBOARD_URL = this.appConfigProvider.getConfig().DASHBOARD_URL;
      // createExternalSidebar(this.renderer, DASHBOARD_URL);

      // // FOR REALTIME TESTING
      // createExternalSidebar(this.renderer, 'http://localhost:4204');

    }
  }

  /** */
  // showNavbar() {
  //   let TEMP = location.search.split('navBar=')[1];
  //   if (TEMP) { this.isNavBar = TEMP.split('&')[0]; }
  // }

  /** */
  hideAlert() {
    this.logger.debug('[APP-COMP] hideAlert');
    this.notificationsEnabled = true;
  }

  private initAudio() {
    // SET AUDIO
    const href = window.location.href;
    const hrefArray = href.split('/#/');
    const chatBaseUrl = hrefArray[0]

    this.audio = new Audio();
    this.audio.src = chatBaseUrl + URL_SOUND_LIST_CONVERSATION;
    this.audio.load();

    this.audio_NewConv = new Audio();
    this.audio_NewConv.src = chatBaseUrl + URL_SOUND_CONVERSATION_ADDED;
    this.audio_NewConv.load();

    this.audio_Unassigned = new Audio();
    this.audio_Unassigned.src = chatBaseUrl + URL_SOUND_CONVERSATION_UNASSIGNED;
    this.audio_Unassigned.load();

    const sound_status = localStorage.getItem('dshbrd----sound')
    if(sound_status && sound_status !== 'undefined'){
      this.isSoundEnabled = sound_status === 'enabled'? true: false
    }else{
      this.isSoundEnabled = true
    }

  }

  onSoundChange(event){
    if(event && event !== undefined){
      localStorage.setItem('dshbrd----sound', event)
      this.isSoundEnabled = event === 'enabled'? true: false
    }
  }

  private manageTabNotification(sound_type: string, badgeNotificationCount?: number) {
    if (!this.isTabVisible) {
      // TAB IS HIDDEN --> manage title and SOUND
      let badgeNewConverstionNumber = badgeNotificationCount? badgeNotificationCount : this.conversationsHandlerService.countIsNew()
      badgeNewConverstionNumber > 0 ? badgeNewConverstionNumber : badgeNewConverstionNumber = 1
      document.title = "(" + badgeNewConverstionNumber + ") " + this.tabTitle

      clearInterval(this.setIntervalTime)
      const that = this
      this.setIntervalTime = setInterval(function () {
        if (document.title.charAt(0) === '(') {
          document.title = that.tabTitle
        } else {
          document.title = "(" + badgeNewConverstionNumber + ") " + that.tabTitle;
        }
      }, 1000);
      // if(this.isSoundEnabled) this.soundMessage()
    }

    const sound_status = localStorage.getItem('dshbrd----sound')
    if(sound_status && sound_status !== 'undefined'){
      this.isSoundEnabled = sound_status === 'enabled'? true: false
    }
    this.logger.debug('[APP-COMP] manageTabNotification can saund?', this.isInitialized, this.isSoundEnabled, sound_type)
    if(this.isInitialized && this.isSoundEnabled) {
      switch(sound_type){
        case 'conv_added': {
          this.soundConversationAdded();
          break;
        }
        case 'new_message': {
          this.soundMessage();
          break;
        }
        case 'conv_unassigned': {
          this.soundConversationUnassigned();
          break;
        }
        default:{
          this.soundMessage();
          break;
        }
      }
    }
  }

  soundMessage() {
    const that = this;
    // this.logger.debug('[APP-COMP] conversation play', this.audio);
    // clearTimeout(this.setTimeoutSound);
    // this.setTimeoutSound = setTimeout(function () {
    //   that.audio.play().then(() => {
    //     that.logger.debug('[APP-COMP] ****** soundMessage played *****');
    //   }).catch((error: any) => {
    //     that.logger.error('[APP-COMP] ***soundMessage error*', error);
    //   });
    // }, 4000);

    //play sound every 4s from the fist time you receive a conversation added/changed
    if(!this.hasPlayed && !this.hasPlayedConversation){
      that.audio.play().then(() => {
        that.hasPlayed = true
        that.logger.debug('[APP-COMP] ****** soundMessage played *****');
        setTimeout(() => {
          that.hasPlayed = false
        }, 4000);
      }).catch((error: any) => {
        that.logger.error('[APP-COMP] ***soundMessage error*', error);
      });
    }
  }

  soundConversationAdded(){
    const that = this;
    if(!this.hasPlayedConversation ){
      that.audio_NewConv.play().then(() => {
        that.hasPlayedConversation = true
        that.logger.debug('[APP-COMP] ****** soundConversationAdded played *****');
        setTimeout(() => {
          that.hasPlayedConversation = false
        }, 4000);
      }).catch((error: any) => {
        that.logger.error('[APP-COMP] ***soundConversationAdded error*', error);
      });
    }
  }

  soundConversationUnassigned(){
    const that = this;
    if(!this.hasPlayedConversationUnassigned ){
      that.audio_Unassigned.play().then(() => {
        that.hasPlayedConversationUnassigned = true
        that.logger.debug('[APP-COMP] ****** soundConversationUnassigned played *****');
        setTimeout(() => {
          that.hasPlayedConversationUnassigned = false
        }, 4000);
      }).catch((error: any) => {
        that.logger.error('[APP-COMP] ***soundConversationUnassigned error*', error);
      });
    }
  }
  /**---------------- SOUND FUNCTIONS --> END <--- +*/
  /***************************************************+*/


  // BEGIN SUBSCRIPTIONS //
  /**      .pipe(
        takeUntil(this.unsubscribe$)
      ) */
  initSubscriptions() {
    this.logger.log('initialize FROM [APP-COMP] - initSubscriptions');

    // ---------------------------------------------------------------------------------------------------
    // Protecting from multiple subsciptions due to multiple app initializations (call to initializeApp())
    // Only one subscriber x application allowed
    // ---------------------------------------------------------------------------------------------------
    if (this.BSAuthStateChangedSubscriptionRef) {
      this.logger.log('initialize FROM [APP-COMP] - BSAuthStateChanged ALREADY SUBSCRIBED');
      return;
    }

    this.BSAuthStateChangedSubscriptionRef = this.messagingAuthService.BSAuthStateChanged.pipe(filter((state) => state !== null)).subscribe((state: any) => {
        this.logger.log('initialize FROM [APP-COMP] - [APP-COMP] ***** BSAuthStateChanged  state', state);

        if (state && state === AUTH_STATE_ONLINE) {
          // const user = this.tiledeskAuthService.getCurrentUser();
          // if (this.isOnline === false) {
          // if (AUTH_STATE_ONLINE) {
          this.IS_ONLINE = true;
          // console.log('[APP-COMP] IS_ONLINE', this.IS_ONLINE)
          this.goOnLine();
          // }
        } else if (state === AUTH_STATE_OFFLINE) {
          // this.checkTokenAndGoOffline() //se c'è un tiledeskToken salvato, allora aspetta, altrimenti vai offline
          this.IS_ONLINE = false;
          // console.log('[APP-COMP] IS_ONLINE', this.IS_ONLINE)
          this.goOffLine()
        }
      }, error => {
        this.logger.error('initialize FROM [APP-COMP] - [APP-COMP] ***** BSAuthStateChanged * error * ', error)
      }, () => {
        this.logger.log('initialize FROM [APP-COMP] - [APP-COMP] ***** BSAuthStateChanged *** complete *** ')
      });


    this.events.subscribe('uidConvSelected:changed', this.subscribeChangedConversationSelected);
    this.events.subscribe('profileInfoButtonClick:logout', this.subscribeProfileInfoButtonLogOut);
    this.events.subscribe('unservedRequest:count', this.subscribeUnservedRequestCount)
    this.events.subscribe('convList:onConversationSelected', this.subscribeConversationSelected)
    this.conversationsHandlerService.conversationAdded.subscribe((conversation: ConversationModel) => {
      // this.logger.log('[APP-COMP] ***** subscribeConversationAdded *****', conversation);
      if (conversation && conversation.is_new === true) {
        this.manageTabNotification('conv_added')
      }
      if(conversation) this.updateConversationsOnStorage()
    });

    this.conversationsHandlerService.conversationChanged.subscribe((conversation: ConversationModel) => {
      // console.log('[APP-COMP] ***** subscribeConversationChanged conversation: ', conversation);
      if(conversation)  this.updateConversationsOnStorage();
      const currentUser = this.tiledeskAuthService.getCurrentUser()
    });

    this.conversationsHandlerService.conversationChangedDetailed.subscribe((changes: {value: ConversationModel, previousValue: ConversationModel}) => {
      // console.log('[APP-COMP] ***** subscribeConversationChangedDetailed conversation: ', changes);
      const currentUser = this.tiledeskAuthService.getCurrentUser()
      if (currentUser && currentUser !== null) {
        this.logger.log('[APP-COMP] ***** subscribeConversationChangedDetailed currentUser: ', currentUser, changes);
        if (changes.value && changes.value.sender !== currentUser.uid) {
          let checkIfStatusChanged = changes.value.is_new === changes.previousValue.is_new? true: false
          let checkIfUidChanged = changes.value.uid === changes.previousValue.uid? true: false
          if(changes.value.is_new && checkIfStatusChanged && checkIfUidChanged){
            this.manageTabNotification('new_message');
          }
        }
      }
    });

    this.conversationsHandlerService.conversationRemoved.subscribe((conversation: ConversationModel) => {
      this.logger.log('[APP-COMP] ***** conversationRemoved *****', conversation);
      if(conversation) { 
        this.updateConversationsOnStorage();
        this.segmentResolved(conversation)
      }
    });
  }

  /**
  * goOnLine:
  * 1 - nascondo splashscreen
  * 2 - recupero il tiledeskToken e lo salvo in chat manager
  * 3 - carico in d
  * @param user
  */
  goOnLine = () => {
    this.logger.log('[APP-COMP]- GO-ONLINE ');
    // this.isOnline = true;
    // this.logger.info('initialize FROM [APP-COMP] - [APP-COMP] - GO-ONLINE isOnline ', this.isOnline);
    // clearTimeout(this.timeModalLogin);
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();

    // const supportmode = this.appConfigProvider.getConfig().supportMode;
    // this.logger.log('[APP-COMP] - GO-ONLINE - supportmode ', supportmode);
    // if (supportmode === true) {
    //   this.connetWebsocket() // moved in the comp project-item
    // }
    this.events.publish('go:online', true);
    const currentUser = this.tiledeskAuthService.getCurrentUser();
    this.setLanguage(currentUser);
    // this.logger.printDebug('APP-COMP - goOnLine****', currentUser);
    this.logger.log('[APP-COMP] - GO-ONLINE - currentUser ', currentUser);
    this.chatManager.setTiledeskToken(tiledeskToken);
    this.chatManager.setCurrentUser(currentUser);
    // this.chatManager.startApp();

    // ----------------------------------------------
    // PUSH NOTIFICATIONS
    // ----------------------------------------------
    const pushEngine = this.appConfigProvider.getConfig().pushEngine

    if (currentUser) {
      if (pushEngine && pushEngine !== 'none') {
        this.notificationsService.getNotificationPermissionAndSaveToken(currentUser.uid);
        this.handleNotifications()
      }
      this.presenceService.setPresence(currentUser.uid);

      this.initConversationsHandler(currentUser.uid);
      this.initArchivedConversationsHandler(currentUser.uid);
      this.segmentSignIn()
    }
    this.checkPlatform();
    try {
      this.logger.debug('[APP-COMP] ************** closeModal', this.authModal);
      if (this.authModal) {
        this.closeModal();
      }
    } catch (err) {
      this.logger.error('[APP-COMP] -> error:', err);
    }
  }




  goOffLine = () => {
    this.logger.log('[APP-COMP] - GO-OFFLINE');
    this.logger.log('[APP-COMP] - GO-OFFINE - supportmode ', this.SUPPORT_MODE);
    if (this.SUPPORT_MODE === true) {
      this.webSocketClose()
    }
    // this.isOnline = false;
    // this.conversationsHandlerService.conversations = [];
    this.chatManager.setTiledeskToken(null);
    this.chatManager.setCurrentUser(null);
    this.chatManager.goOffLine();

    this.router.navigateByUrl('conversation-detail/'); //redirect to basePage
    if(this.IS_ON_MOBILE_DEVICE){
      clearTimeout(this.timeModalLogin);
      this.timeModalLogin = setTimeout(() => {
        if (!this.hadBeenCalledOpenModal) {
          this.authModal = this.presentModal('initAuthentication');
          this.hadBeenCalledOpenModal = true;
        }
      }, 1000)
    }else{
      this.goToDashboardLogin()
    }
    

    // if (!this.hadBeenCalledOpenModal) {
    //   this.authModal = this.presentModal('goOffLine');
    //   this.hadBeenCalledOpenModal = true
    // }

    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();
    
  }

  goToDashboardLogin(){
    let DASHBOARD_URL = this.appConfigProvider.getConfig().dashboardUrl + '#/login'
    const myWindow = window.open(DASHBOARD_URL, '_self');
    myWindow.focus();
  }


  webSocketClose() {
    this.logger.log('[APP-COMP] - GO-OFFLINE - webSocketClose');
    this.webSocketJs.close()
    this.events.publish('go:offline', true);
  }

  // BEGIN RESIZE FUNCTIONS //
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const that = this;
    // this.logger.debug('this.doitResize)', this.doitResize)
    // clearTimeout(this.doitResize);
    // this.doitResize = setTimeout(() => {
    let platformIsNow = PLATFORM_DESKTOP;
    if (checkPlatformIsMobile()) {
      platformIsNow = PLATFORM_MOBILE;
      this.logger.log('onResize platformIsNow ', platformIsNow)
    }
    if (!this.platformIs || this.platformIs === '') {
      this.platformIs = platformIsNow;
    }
    this.logger.debug('[APP-COMP] onResize width::::', window.innerWidth);
    this.logger.debug('[APP-COMP] onResize width:::: platformIsNow', platformIsNow);
    this.logger.debug('[APP-COMP] onResize width:::: this.platformIs', this.platformIs);
    this.logger.debug('[APP-COMP] onResize width:::: platformIsNow', platformIsNow);
    if (platformIsNow !== this.platformIs) {
      window.location.reload();
      // this.checkPlatform();
      // this.initializeApp('onresize')
      this.checkPlatform();
      // this.goOnLine()
      // // this.initSubscriptions();

    }

    // }, 0);
  }
  // END RESIZE FUNCTIONS //

  /**
   * ::: subscribeChangedConversationSelected :::
   * evento richiamato quando si seleziona un utente nell'elenco degli user
   * apro dettaglio conversazione
   */
  subscribeChangedConversationSelected = (user: UserModel, type: string) => {
    this.logger.log('[APP-COMP] subscribeUidConvSelectedChanged navigateByUrl', user, type);
    // this.router.navigateByUrl('conversation-detail/' + user.uid + '?conversationWithFullname=' + user.fullname);
    this.router.navigateByUrl('conversation-detail/' + user.uid + '/' + user.fullname + '/' + type);
  }

  subscribeProfileInfoButtonLogOut = (hasClickedLogout) => {
    this.logger.log('[APP-COMP] FIREBASE-NOTIFICATION >>>>  subscribeProfileInfoButtonLogOut ');
    // if (hasClickedLogout === true) {
    //   this.removePresenceAndLogout()
    // }


    if (hasClickedLogout === true) {
      this.segmentSignedOut()
      this.appStorageService.removeItem('conversations')
      this.isInitialized = false;
      // ----------------------------------------------
      // PUSH NOTIFICATIONS
      // ----------------------------------------------
      const that = this;
      const pushEngine = this.appConfigProvider.getConfig().pushEngine
      if (pushEngine && pushEngine !== 'none') {
        this.notificationsService.removeNotificationsInstance(function (res) {
          that.logger.log('[APP-COMP] FIREBASE-NOTIFICATION >>>>  removeNotificationsInstance > CALLBACK RES', res);

          if (res === 'success') {
            that.removePresenceAndLogout();
            
          } else {
            that.removePresenceAndLogout();
            // that.presentToast();
          }
        });
      } else {
        this.removePresenceAndLogout()
      }
    }
  }

  subscribeUnservedRequestCount = (unservedRequestCount) => {
    if(unservedRequestCount && unservedRequestCount > 0){
      this.logger.debug("subscribeUnservedRequestCount appIsInitialized::::",this.isInitialized)
      if(this.isInitialized){
        this.manageTabNotification('conv_unassigned', unservedRequestCount) //sound and alternate title
      }
    }
  }

  subscribeConversationSelected= (conversation: ConversationModel) => {
    if(conversation && conversation.is_new){
      this.audio_NewConv.pause()
    }
  }

  private async presentModal(calledby): Promise<any> {
    this.logger.log('[APP-COMP] presentModal calledby', calledby, '- hadBeenCalledOpenModal: ', this.hadBeenCalledOpenModal);
    const attributes = { tenant: this.tenant, enableBackdropDismiss: false };
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: LoginPage,
        componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: false
      });
    modal.onDidDismiss().then((detail: any) => {
      this.hadBeenCalledOpenModal = false
      this.logger.log('[APP-COMP] presentModal onDidDismiss detail.data ', detail.data);
      // this.checkPlatform();
      if (detail !== null) {
        //  this.logger.debug('The result: CHIUDI!!!!!', detail.data);
      }
    });
    // await modal.present();
    // modal.onDidDismiss().then((detail: any) => {
    //    this.logger.debug('The result: CHIUDI!!!!!', detail.data);
    //   //  this.checkPlatform();
    //    if (detail !== null) {
    //     //  this.logger.debug('The result: CHIUDI!!!!!', detail.data);
    //    }
    // });
    return await modal.present();
  }

  private async closeModal() {
    this.logger.debug('[APP-COMP] closeModal', this.modalController);
    this.logger.debug('[APP-COMP] closeModal .getTop()', this.modalController.getTop());
    await this.modalController.getTop();
    this.modalController.dismiss({ confirmed: true });
  }


  async presentToast() {
    const toast = await this.toastController.create({
      message: this.toastMsgErrorWhileUnsubscribingFromNotifications,
      duration: 2000
    });
    toast.present();
  }

  removePresenceAndLogout() {
    this.logger.debug('[APP-COMP] FIREBASE-NOTIFICATION >>>> calling removePresenceAndLogout');
    this.presenceService.removePresence();
    this.tiledeskAuthService.logOut()
    this.messagingAuthService.logout()
  }

  private initConversationsHandler(userId: string) {
    const keys = ['YOU', 'INFO_A_NEW_SUPPORT_REQUEST_HAS_BEEN_ASSIGNED_TO_YOU'];
    const translationMap = this.translateService.translateLanguage(keys);

    this.logger.log('[APP-COMP] initConversationsHandler ------------->', userId, this.tenant);
    // 1 - init chatConversationsHandler and  archviedConversationsHandler
    this.conversationsHandlerService.initialize(this.tenant, userId, translationMap);
    // this.subscribeToConvs()
    this.conversationsHandlerService.subscribeToConversations(null, () => {
      // this.logger.log('[APP-COMP] - CONVS - INIT CONV')
      const conversations = this.conversationsHandlerService.conversations;
      this.logger.info('initialize FROM [APP-COMP] - [APP-COMP]-CONVS - INIT CONV CONVS', conversations)
      // this.logger.printDebug('SubscribeToConversations (convs-list-page) - conversations')
      if (!conversations || conversations.length === 0) {
        // that.showPlaceholder = true;
        this.logger.debug('[APP-COMP]-CONVS - INIT CONV CONVS 2', conversations)
        this.events.publish('appcompSubscribeToConvs:loadingIsActive', false);
      }
    });

  }

  private updateConversationsOnStorage(){
    const that = this
    // reset timer and save conversation on storage after 2s
    clearTimeout(this.setTimeoutConversationsEvent);
    this.setTimeoutConversationsEvent = setTimeout(() => {
      that.logger.debug('[APP-COMP] updateConversationsOnStorage: reset timer and save conversations -> ', this.conversationsHandlerService.conversations.length)
      that.appStorageService.setItem('conversations', JSON.stringify(that.conversationsHandlerService.conversations))
      that.isInitialized = true;
      this.events.publish('appComp:appIsInitialized', true)
    }, 10000);
  }

  private initArchivedConversationsHandler(userId: string) {
    const keys = ['YOU'];
    const translationMap = this.translateService.translateLanguage(keys);

    this.logger.debug('[APP-COMP] initArchivedConversationsHandler ------------->', userId, this.tenant);
    // 1 - init  archviedConversationsHandler
    this.archivedConversationsHandlerService.initialize(this.tenant, userId, translationMap);
  }

  checkAndRemoveDashboardForegroundCount(){
    try {
      const dashboardForegroundCount = localStorage.getItem('dshbrd----foregroundcount')
      this.logger.log('[SIDEBAR] - THERE IS DASHBOARD FOREGROUND COUNT', dashboardForegroundCount)
      if (dashboardForegroundCount && dashboardForegroundCount !== 'undefined') {
        localStorage.setItem('dshbrd----foregroundcount', '0')
      }
    } catch (err) {
      this.logger.error('Get local storage dshbrd----foregroundcount ', err)
    }
  }

  private handleNotifications(){
    if(!this.platform.is('desktop')){
       this.fcm.onNotification().subscribe(data => {
          let pageUrl = 'conversation-detail/'
          if (data.wasTapped) {
            console.log("FCM: Received in background", JSON.stringify(data));
            let IDConv = data.channel_type === "group" ? data.recipient : data.sender;
            let FullNameConv = data.sender_fullname
            let Convtype = 'active'
            
            if (IDConv && FullNameConv) {
              pageUrl += IDConv + '/' + FullNameConv + '/' + Convtype
            }
            // replace(/\(/g, '%28').replace(/\)/g, '%29') -> used for the encoder of any round brackets
            this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29').replace( /#/g, "%23" ));
          } else {
            console.log("FCM: Received in foreground", JSON.stringify(data));
            // let IDConv = data.recipient
            // let FullNameConv = data.sender_fullname
            // let Convtype = 'active'
            
            // if (IDConv && FullNameConv) {
            //   pageUrl += IDConv + '/' + FullNameConv + '/' + Convtype
            // }
            // // replace(/\(/g, '%28').replace(/\)/g, '%29') -> used for the encoder of any round brackets
            // this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29').replace( /#/g, "%23" ));
          };
        });
    }
  }

  private loadCustomScript(config){
    if(config.hasOwnProperty("globalRemoteJSSrc")){
      this.scriptService.buildScriptArray(config['globalRemoteJSSrc'])
    }
  }

  private segmentSignIn(){
    let user = this.tiledeskAuthService.getCurrentUser()
    if(window['analytics']){
      try {
        window['analytics'].page("Chat Auth Page, Signin", {});
      } catch (err) {
        this.logger.error('Event:Signed In [page] error', err);
      }
  
      try {
        window['analytics'].identify(user.uid, {
          name: user.firstname + ' ' + user.lastname,
          email: user.email,
          logins: 5,
  
        });
      } catch (err) {
        this.logger.error('Event:Signed In [identify] error', err);
      }
      // Segments
      try {
        window['analytics'].track('Signed In', {
          "username": user.firstname + ' ' + user.lastname,
          "userId": user.uid
        });
      } catch (err) {
        this.logger.error('Event:Signed In [track] error', err);
      }
    }
  }


  private segmentSignedOut(){
    let user = this.tiledeskAuthService.getCurrentUser()
    if(window['analytics']){
      try {
        window['analytics'].page("Chat Auth Page, Signed Out", {});
      } catch (err) {
        this.logger.error('Event:Signed Out [page] error', err);
      }
  
      try {
        window['analytics'].identify(user.uid, {
          name: user.firstname + ' ' + user.lastname,
          email: user.email,
          logins: 5,
  
        });
      } catch (err) {
        this.logger.error('Event:Signed Out [identify] error', err);
      }
  
      try {
        window['analytics'].track('Signed Out', {
          "username": user.firstname + ' ' + user.lastname,
          "userId": user.uid
        });
      } catch (err) {
        this.logger.error('Event:Signed Out [track] error', err);
      }
  
      try {
        // setTimeout(() => {
        window['analytics'].reset()
        // }, 0);
      } catch (err) {
        this.logger.error('Event:reset error', err);
      }
    }
  }

  private segmentResolved(conversation: ConversationModel){
    let user = this.tiledeskAuthService.getCurrentUser();
    if(window['analytics']){
      try {
        window['analytics'].page("Chat List Conversations Page, Chat Resolved", {});
      } catch (err) {
        this.logger.error('Event:Chat Resolved [page] error', err);
      }
  
      try {
        window['analytics'].identify(user.uid, {
          name: user.firstname + ' ' + user.lastname,
          email: user.email,
          logins: 5,
  
        });
      } catch (err) {
        this.logger.error('Event:Chat Resolved [identify] error', err);
      }
  
      try {
        window['analytics'].track('Chat Resolved', {
          "username": user.firstname + ' ' + user.lastname,
          "userId": user.uid,
          "conversation_id": conversation.uid,
          "channel_type": conversation.channel_type,
          "conversation_with":(conversation.channel_type !== TYPE_DIRECT)? null: conversation.conversation_with,
          "department_name":(conversation.channel_type !== TYPE_DIRECT)? conversation.attributes.departmentName: null,
          "department_id":(conversation.channel_type !== TYPE_DIRECT)? conversation.attributes.departmentId: null
        },
        { "context": {
            "groupId": (conversation.channel_type !== TYPE_DIRECT)? conversation.attributes.projectId: null
          }
        });
      } catch (err) {
        this.logger.error('Event:Chat Resolved [track] error', err);
      }
  
      if(conversation.channel_type !== TYPE_DIRECT){
        try {
          window['analytics'].group(conversation.attributes.projectId, {
            name: (conversation.attributes.project_name)? conversation.attributes.project_name : null,
            // plan: projectProfileName,
          });
        } catch (err) {
          this.logger.error('Event:Chat Resolved [group] error', err);
        }
      }
    }
  }


  @HostListener('document:visibilitychange', [])
  visibilitychange() {
    // this.logger.debug("document TITLE", document.hidden, document.title);
    if (document.hidden) {
      this.isTabVisible = false
    } else {
      // TAB IS ACTIVE --> restore title and DO NOT SOUND
      clearInterval(this.setIntervalTime)
      this.isTabVisible = true;
      document.title = this.tabTitle;
      this.checkAndRemoveDashboardForegroundCount()
    }
  }

  // Storage event not firing: This won't work on the same page that is making the changes
  // https://stackoverflow.com/questions/35865481/storage-event-not-firing
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
  @HostListener('window:storage', ['$event'])
  onStorageChanged(event: any) {

    if (event.key !== 'chat_sv5__tiledeskToken' && event.key !== 'dshbrd----sound') {
      return;
    }

    if (this.appStorageService.getItem('tiledeskToken') === null) {
      // console.log('[APP-COMP] - onStorageChanged tiledeskToken is null - RUN LOGOUT')
      this.tiledeskAuthService.logOut()
      this.messagingAuthService.logout();
      this.events.publish('profileInfoButtonClick:logout', true);
      // this.isOnline = false;
    }
    else {
      const currentUser = this.tiledeskAuthService.getCurrentUser();
      // console.log('[APP-COMP] - X - onStorageChanged currentUser', currentUser)

      const currentToken = this.tiledeskAuthService.getTiledeskToken();
      // console.log('[APP-COMP] - onStorageChanged currentToken', currentToken)
      if (this.appStorageService.getItem('tiledeskToken') !== null && currentToken !== this.appStorageService.getItem('tiledeskToken')) {

        // console.log('[APP-COMP] - onStorageChanged wentOnline 2')
        // DEALLOCO RISORSE OCCUPATE
        this.messagingAuthService.logout();
        this.appStorageService.removeItem('currentUser')
        this.tiledeskAuthService.setCurrentUser(null);
        // this.unsubscribe$.next();
        // this.unsubscribe$.complete();
        this.initializeApp('onstoragechanged');



        // console.log('[APP-COMP]  onAuthStateChanged HERE !!! ')
        // firebase.auth().onAuthStateChanged(user => {
        //   console.log('[APP-COMP]  onAuthStateChanged', user)
        // })

      }
    }

    if(event.key === 'dshbrd----sound'){
      this.events.publish('storage:sound', event.newValue);
      this.isSoundEnabled = event.newValue === 'enabled'? true: false
    }
  }


  // @HostListener('mouseenter', ['$event']) 
  // onMouseEnter(event: any) {
  //   console.log('HostListener onMouseEnter-->', event)
  // }

  // @HostListener('mouseleave', ['$event']) 
  // onMouseLeave(event: any) {
  //   console.log('HostListener onMouseLeave-->', event)
  // }

  // @HostListener('focus', ['$event']) 
  // onFocus(event: any) {
  //   console.log('HostListener onFocus-->', event)
  // }

  // @HostListener('blur', ['$event']) 
  // onBlur(event: any) {
  //   console.log('HostListener onBlur-->', event)
  // }
}
