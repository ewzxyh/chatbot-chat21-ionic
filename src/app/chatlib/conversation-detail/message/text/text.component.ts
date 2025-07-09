import { Component, EventEmitter, Input, OnChanges, OnInit, Output, Sanitizer } from '@angular/core';
import { MAX_WIDTH_IMAGES } from 'src/chat21-core/utils/constants';
@Component({
  selector: 'chat-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  @Input() text: string;
  @Input() color: string;
  @Input() fontSize: string;
  @Input() fontFamily: string;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();

  @Input() message: any;


  constructor() { }

  ngOnInit() {
  }


  printMessage(text, messageEl, component) {
    const messageOBJ = { messageEl: messageEl, component: component }
    this.onBeforeMessageRender.emit(messageOBJ)
    const messageText = text;
    this.onAfterMessageRender.emit(messageOBJ)
    // this.triggerBeforeMessageRender(message, messageEl, component);
    // const messageText = message.text;
    // this.triggerAfterMessageRender(message, messageEl, component);
    return messageText;
  }

}
