import { PopoverController } from '@ionic/angular';
import { LoggerInstance } from './../../../chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { MessageModel } from './../../../chat21-core/models/message';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ion-bubbleinfo-popover',
  templateUrl: './bubbleinfo-popover.component.html',
  styleUrls: ['./bubbleinfo-popover.component.scss'],
})
export class BubbleInfoPopoverComponent implements OnInit {

  @Input() message: MessageModel

  private logger: LoggerService = LoggerInstance.getInstance()
  
  constructor(private ctr: PopoverController) { }

  ngOnInit() {
    this.logger.debug('[BUBBLE-INFO-POPOVER] ngOnInit message data:', this.message)
  }

  onClose(){
    this.ctr.dismiss()
  }

}
