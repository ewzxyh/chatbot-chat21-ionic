import { BubbleInfoPopoverComponent } from '../../components/bubbleMessageInfo-popover/bubbleinfo-popover.component';
import { BubbleMessageComponent } from './../../chatlib/conversation-detail/message/bubble-message/bubble-message.component';
import { CannedResponseComponent } from './../../components/canned-response/canned-response.component';
import { TruncatePipe } from './../../directives/truncate.pipe';
import { IonConversationDetailComponent } from '../../chatlib/conversation-detail/ion-conversation-detail/ion-conversation-detail.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from '../../../chat21-core/utils/utils';

import { IonicModule } from '@ionic/angular';
import { ConversationDetailPageRoutingModule } from './conversation-detail-routing.module';
import { ConversationDetailPage } from './conversation-detail.page';

// import { InfoSupportGroupComponent } from '../../components/conversation-info/info-support-group/info-support-group.component';
// import { InfoDirectComponent } from '../../components/conversation-info/info-direct/info-direct.component';
// import { InfoGroupComponent } from '../../components/conversation-info/info-group/info-group.component';

// tslint:disable-next-line: max-line-length
import { HeaderConversationDetailComponent } from '../../components/conversation-detail/header-conversation-detail/header-conversation-detail.component';
import { MessageTextAreaComponent } from '../../components/conversation-detail/message-text-area/message-text-area.component';
// import { InfoContentComponent } from '../../components/conversation-info/info-content/info-content.component';
// import { InfoDirectComponent } from '../../components/conversation-info/info-direct/info-direct.component';
import { InfoContentComponent } from 'src/app/components/conversation-info/info-content/info-content.component';
import { InfoSupportGroupComponent } from 'src/app/components/conversation-info/info-support-group/info-support-group.component';
import { InfoDirectComponent } from 'src/app/components/conversation-info/info-direct/info-direct.component';
import { InfoGroupComponent } from 'src/app/components/conversation-info/info-group/info-group.component';


import { SharedModule } from 'src/app/shared/shared.module';
import { ScrollbarThemeModule } from '../../utils/scrollbar-theme.directive';
import { PickerModule } from '@ctrl/ngx-emoji-mart';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConversationDetailPageRoutingModule,
    ScrollbarThemeModule,
    PickerModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
    }),
    SharedModule,
  ],
  // entryComponents: [MessageTextAreaComponent],
  entryComponents: [ BubbleInfoPopoverComponent],
  declarations: [
    ConversationDetailPage,
    HeaderConversationDetailComponent,
    MessageTextAreaComponent,
    CannedResponseComponent,
    BubbleInfoPopoverComponent,
    // InfoContentComponent,
    // InfoSupportGroupComponent,
    // InfoDirectComponent,
    // InfoGroupComponent,
    TruncatePipe
  ]
})
export class ConversationDetailPageModule {}
