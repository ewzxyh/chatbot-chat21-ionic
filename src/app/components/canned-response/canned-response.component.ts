import { Component, Input, OnInit, SimpleChange, ElementRef } from '@angular/core';
import { CannedResponsesService } from 'src/app/services/canned-responses/canned-responses.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { UserModel } from 'src/chat21-core/models/user';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { compareValues, htmlEntities } from 'src/chat21-core/utils/utils';

@Component({
  selector: 'app-canned-response',
  templateUrl: './canned-response.component.html',
  styleUrls: ['./canned-response.component.scss'],
})
export class CannedResponseComponent implements OnInit {

  // @Input() tagsCannedFilter: any = []
  @Input() conversationWith: string;
  @Input() conversationWithFullname: string;
  @Input() currentString: string;
  @Input() translationMap: Map<string, string>
  public loggedUser: UserModel
  
  public tagsCanned: any = []
  public tagsCannedCount: number
  public tagsCannedFilter: any = []

  private logger: LoggerService = LoggerInstance.getInstance();
  constructor(
    public tiledeskAuthService: TiledeskAuthService,
    public tiledeskService: TiledeskService,
    public cannedResponsesService: CannedResponsesService,
    public el: ElementRef
  ) { }

  ngOnInit() {
    this.loggedUser = this.tiledeskAuthService.getCurrentUser()
  }

  ngOnChanges(changes: SimpleChange){
    this.logger.debug('[CANNED] - loadTagsCanned strSearch ', this.currentString)
    if(this.currentString !== undefined){
      this.loadTagsCanned(this.currentString, this.conversationWith)
    }
  }

  // ----------------------------------------------------------
  // @ CANNED RESPONSES methods
  // ----------------------------------------------------------
  loadTagsCanned(strSearch, conversationWith) {
    this.logger.log('[CANNED] - loadTagsCanned strSearch ', strSearch)
    this.logger.log('[CANNED] - loadTagsCanned conversationWith ', conversationWith)

    const conversationWith_segments = conversationWith.split('-')
    // Removes the last element of the array if is = to the separator
    if (conversationWith_segments[conversationWith_segments.length - 1] === '') {
      conversationWith_segments.pop()
    }

    this.logger.log('[CANNED] - loadTagsCanned conversationWith_segments ', conversationWith_segments)
    let projectId = ''

    if (conversationWith_segments.length === 4) {
      projectId = conversationWith_segments[2]
      this.logger.log('[CANNED] - loadTagsCanned projectId ', projectId)
      this.getAndShowCannedResponses(strSearch, projectId)
    } else {
      this.getProjectIdByConversationWith(strSearch, this.conversationWith)
    }
  }

  getProjectIdByConversationWith(strSearch, conversationWith: string) {
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()

    this.tiledeskService.getProjectIdByConvRecipient(tiledeskToken, conversationWith).subscribe((res) => {
      this.logger.log('[CANNED] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT RES', res)
      if (res) {
        const projectId = res.id_project
        this.logger.log('[CANNED] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT projectId ', projectId)
        if (projectId) {
          this.getAndShowCannedResponses(strSearch, projectId)
        }
      }
    }, (error) => {
      this.logger.error('[CANNED] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error)
    }, () => {
      this.logger.log('[CANNED] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT * COMPLETE *')
    })
  }

  getAndShowCannedResponses(strSearch, projectId) {
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CANNED] - loadTagsCanned tagsCanned.length', this.tagsCanned.length)
    //if(this.tagsCanned.length <= 0 ){
    this.tagsCanned = []
    this.cannedResponsesService.getAll(tiledeskToken, projectId).subscribe((res) => {
      this.logger.log('[CANNED] - loadTagsCanned  getCannedResponses RES', res)

      this.tagsCanned = res
      this.tagsCannedCount = res.length
      this.logger.log('[CANNED] - loadTagsCanned  getCannedResponses tagsCannedCount', this.tagsCannedCount)
      // if (this.HIDE_CANNED_RESPONSES === false) {
        this.showTagsCanned(strSearch)
      // }
    }, (error) => {
      this.logger.error('[CANNED] - loadTagsCanned  getCannedResponses - ERROR  ', error)
    }, () => {
      this.logger.log('[CANNED] - loadTagsCanned  getCannedResponses * COMPLETE *')
    })
  }

  showTagsCanned(strSearch) {
    this.logger.log('[CANNED] - showTagsCanned strSearch ', strSearch)
    this.tagsCannedFilter = []
    var tagsCannedClone = JSON.parse(JSON.stringify(this.tagsCanned))
    this.logger.log('[CANNED] - showTagsCanned tagsCannedClone ', tagsCannedClone)
    //this.logger.log("that.contacts lenght:: ", strSearch);
    this.tagsCannedFilter = this.filterItems(tagsCannedClone, strSearch)
    this.logger.log('[CANNED] - showTagsCanned tagsCannedFilter ', this.tagsCannedFilter)

    this.tagsCannedFilter.sort(compareValues('title', 'asc'))
    var strReplace = strSearch
    if (strSearch.length > 0) {
      strReplace = "<b class='highlight-search-string'>" + strSearch + '</b>'
    }
    // for (var i = 0; i < this.tagsCannedFilter.length; i++) {
    //   let text = htmlEntities(this.tagsCannedFilter[i].text);
    //   // const textCanned = "<div class='cannedText'>" + this.replacePlaceholderInCanned(this.tagsCannedFilter[i].text) + '</div>'
    //   const textCanned = "<div class='cannedText'>" + this.replacePlaceholderInCanned(text) + '</div>'
    //   let title = htmlEntities(this.tagsCannedFilter[i].title)
    //   // this.tagsCannedFilter[i].title = "<div class='cannedContent'><div class='cannedTitle'>" + this.tagsCannedFilter[i].title.toString().replace(strSearch, strReplace.trim()) + '</div>' + textCanned + '</div>'
    //   this.tagsCannedFilter[i].title = "<div class='cannedContent'><div class='cannedTitle'>" + title.toString().replace(strSearch, strReplace.trim()) + '</div>' + textCanned + '</div>'
    // }
    this.tagsCannedFilter.forEach(canned => {
      canned.text = this.replacePlaceholderInCanned(canned.text);
      canned.disabled = true
    });
    if (this.tagsCannedCount === 0) {
      // const button = this.renderer.createElement('button');
      // const buttonText = this.renderer.createText('Click me');
      // this.renderer.appendChild(button, buttonText);
      // console.log('[CANNED] - this.el.nativeElement ', this.el.nativeElement)
      // this.renderer.listen(button, 'click', () => { alert('hi'); });
      // let nocanned = {}
      // if (this.USER_ROLE !== 'agent') {
      const nocanned = {
        // "<div class='cannedContent'><div class='cannedTitle nocannedTitle #noCannedTitle'>" + this.translationMap.get('THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE') + ".</div><div class='cannedText'>" + this.translationMap.get('TO_CREATE_THEM_GO_TO_THE_PROJECT') + '</div></div>'
        // <div class='cannedText no-canned-available-text'>" + this.translationMap.get('AddNewCannedResponse') + '</div>
        title:
          "<div class='cannedContent'><div class='cannedTitle nocannedTitle #noCannedTitle'>" + this.translationMap.get('THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE') + ".</div></div>",
        text: 'There are no canned responses available',
      }
      // } else if (this.USER_ROLE === 'agent') {
      //   nocanned = {
      //     // "<div class='cannedContent'><div class='cannedTitle nocannedTitle #noCannedTitle'>" + this.translationMap.get('THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE') + ".</div><div class='cannedText'>" + this.translationMap.get('TO_CREATE_THEM_GO_TO_THE_PROJECT') + '</div></div>'
      //     title:
      //       "<div class='cannedContent'><div class='cannedTitle nocannedTitle #noCannedTitle'>" + this.translationMap.get('THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE') + ".</div></div>",
      //     text: 'There are no canned responses available',
      //   }
      // }
      this.tagsCannedFilter.push(nocanned)
    }
  }

  filterItems(items, searchTerm) {
    this.logger.log('[CANNED] filterItems tagsCannedClone ', items, ' searchTerm: ', searchTerm)
    //this.logger.log("filterItems::: ",searchTerm);
    return items.filter((item) => {
      //this.logger.log("filterItems::: ", item.title.toString().toLowerCase());
      this.logger.log('[CANNED] filtered tagsCannedClone item ', item)
      return (
        item.title
          .toString()
          .toLowerCase()
          .indexOf(searchTerm.toString().toLowerCase()) > -1
      )
    })
  }

  replacePlaceholderInCanned(str) {
    this.logger.log('[CANNED] - replacePlaceholderInCanned str ', str)
    str = str.replace('$recipient_name', this.conversationWithFullname)
    if (this.loggedUser && this.loggedUser.fullname) {
      str = str.replace('$agent_name', this.loggedUser.fullname)
    }
    return str
  }


  onEditCanned(canned, ev){
    ev.preventDefault()
    ev.stopPropagation()
    canned.disabled = false
    this.logger.log('[CONVS-DETAIL] onEditCanned ', canned)
    setTimeout(() => {
      this.el.nativeElement.querySelector('#titleCanned_'+canned._id).setFocus()
    }, 500);
  }

  onConfirmEditCanned(canned, ev){
    ev.preventDefault()
    ev.stopPropagation()
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CONVS-DETAIL] onConfirmEditCanned ', canned, ev)
    this.cannedResponsesService.edit(tiledeskToken, canned.id_project, canned).subscribe(cannedRes=> {
      canned.disabled = true
    }, (error) => {
      this.logger.error('[CONVS-DETAIL] - onConfirmEditCanned - ERROR  ', error)
    }, () => {
      this.logger.log('[CONVS-DETAIL] - onConfirmEditCanned * COMPLETE *')
    })
  }
  
  onDeleteCanned(canned, ev){
    ev.preventDefault()
    ev.stopPropagation()
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CONVS-DETAIL] onDeleteCanned ', canned)
    this.cannedResponsesService.delete(tiledeskToken, canned.id_project, canned._id).subscribe(cannedRes=> {
      if(cannedRes.status === 1000){
        this.tagsCannedFilter.splice(this.tagsCannedFilter.findIndex(el => el._id === canned._id), 1)
      }
    }, (error) => {
      this.logger.error('[CONVS-DETAIL] - onConfirmEditCanned - ERROR  ', error)
    }, () => {
      this.logger.log('[CONVS-DETAIL] - onConfirmEditCanned * COMPLETE *')
    })
  }

}
