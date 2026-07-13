import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MomentModule } from 'angular2-moment';
import { MessageModel } from 'src/chat21-core/models/message';

import { BubbleMessageComponent } from './bubble-message.component';

describe('BubbleMessageComponent', () => {
  let component: BubbleMessageComponent;
  let fixture: ComponentFixture<BubbleMessageComponent>;

  const createAudioMessage = (text: string): MessageModel => new MessageModel(
    'message-id',
    'pt',
    'recipient-id',
    'Recipient',
    'sender-id',
    'Sender',
    200,
    { src: 'audio.ogg', type: 'audio/ogg' },
    text,
    Date.now(),
    'file',
    {},
    'group',
    true
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BubbleMessageComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        MomentModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BubbleMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect structured CaseZap audio messages', () => {
    const message = {
      text: '[casezap-audio:eyJzcmMiOiJhdWRpby5vZ2cifQ==] Mensagem de voz'
    };

    expect(component.isStructuredAudio(message)).toBe(true);
  });

  it('should keep the native player for regular audio messages', () => {
    const message = { text: 'Mensagem de voz' };

    expect(component.isStructuredAudio(message)).toBe(false);
  });

  it('should keep the native player when the structured payload is invalid', () => {
    const message = { text: '[casezap-audio:bm90LWpzb24=] Mensagem de voz' };

    expect(component.isStructuredAudio(message)).toBe(false);
  });

  it('should render only the structured player placeholder for CaseZap audio', () => {
    component.message = createAudioMessage('[casezap-audio:eyJzcmMiOiJhdWRpby5vZ2cifQ==] Mensagem de voz');

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('chat-audio'))).toBeNull();
  });

  it('should render the native player for regular audio', () => {
    component.message = createAudioMessage('Mensagem de voz');

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('chat-audio'))).not.toBeNull();
  });

  it('should have a "chat-text" child element', () => {
    const messages: any = {
          attributes: {
              projectId: "6013ec749b32000045be650e",
              tiledesk_message_id: "611cbf8ffb379b00346660e7"
          },
          channel_type: "group",
          recipient: "support-group-6013ec749b32000045be650e-4904aee91f8b487aad117bcda860549d",
          recipient_fullname: "Guest ",
          sender: "bot_602256f6c001b800342cb76f",
          sender_fullname: "BOT2",
          status: 150,
          text: "Hello 👋. I'm a bot 🤖.\n\nChoose one of the options below or write a message to reach our staff.",
          timestamp: 1629273999970,
          type: "text",
          uid: "-MhNI3eaIoLTOLoX3TAu",
          isSender: false
    }
    component.message = messages
    component.fontColor = 'black'
    fixture.detectChanges()
    const textChild = fixture.debugElement.query(By.css('chat-text'))
    textChild.properties.text
    expect(textChild).toBeTruthy();
  })

  it('should have a text inside "chat-text" child element', () => {
    const messages: any = {
          attributes: {
              projectId: "6013ec749b32000045be650e",
              tiledesk_message_id: "611cbf8ffb379b00346660e7"
          },
          channel_type: "group",
          recipient: "support-group-6013ec749b32000045be650e-4904aee91f8b487aad117bcda860549d",
          recipient_fullname: "Guest ",
          sender: "bot_602256f6c001b800342cb76f",
          sender_fullname: "BOT2",
          status: 150,
          text: "Hello 👋. I'm a bot 🤖.\n\nChoose one of the options below or write a message to reach our staff.",
          timestamp: 1629273999970,
          type: "text",
          uid: "-MhNI3eaIoLTOLoX3TAu",
          isSender: false
    }
    component.message = messages
    component.fontColor = 'black'
    fixture.detectChanges()
    const textChild = fixture.debugElement.query(By.css('chat-text'))
    expect(textChild.properties.text).toEqual(messages.text)
  })
});
