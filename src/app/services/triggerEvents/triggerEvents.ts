import { MessageModel } from "src/chat21-core/models/message";
import { LoggerService } from "src/chat21-core/providers/abstract/logger.service";
import { LoggerInstance } from "src/chat21-core/providers/logger/loggerInstance";
import { AppConfigProvider } from "../app-config";
import { ConversationModel } from "src/chat21-core/models/conversation";
import { ElementRef, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class TriggerEvents {

    private el: ElementRef;
    private windowContext;
    private logger: LoggerService = LoggerInstance.getInstance()
    
    constructor(
        private appConfig: AppConfigProvider
    ){}

    public setElement(el: ElementRef){
        this.el = el
    }

    public setWindowContext(windowContext){
        this.windowContext = windowContext
    }


    public triggerOnAuthStateChanged(detailObj: {}) {
        this.logger.debug(' ---------------- triggerOnAuthStateChanged ---------------- ', detailObj);
        try {
            const onAuthStateChanged = new CustomEvent('onAuthStateChanged', { detail: detailObj});
            const windowContext = this.windowContext;
            if (windowContext){
                window.parent.document.dispatchEvent(onAuthStateChanged);
                // this.el.nativeElement.dispatchEvent(onAuthStateChanged);
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }
    }

    public triggerAfterSendMessageEvent(messageSent: MessageModel){
        this.logger.debug(' ---------------- triggerAfterSendMessageEvent ---------------- ', messageSent);
        try {
            const onAfterMessageSend = new CustomEvent('onAfterMessageSend', { detail: { message: messageSent } });
            const windowContext = this.windowContext;
            if (windowContext){
                windowContext.document.dispatchEvent(onAfterMessageSend);
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }

    }

    
    public triggerAfterMessageReceived(message: MessageModel){
        this.logger.debug(' ---------------- triggerAfterMessageReceived ---------------- ', message);
        try {
            const onAfterMessageReceived = new CustomEvent('onAfterMessageReceived', { detail: { message: message } });
            const windowContext = this.windowContext;
            if (windowContext){
                windowContext.document.dispatchEvent(onAfterMessageReceived);
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }

    }

    public triggerOnNewConversationInit(conversation: ConversationModel){
        this.logger.debug(' ---------------- triggerAfterMessageReceived ---------------- ', conversation);
        try {
            const onNewConversation = new CustomEvent('onNewConversationComponentInit', { detail: { conversation: conversation} });
            const windowContext = this.windowContext;
            if (windowContext){
                windowContext.document.dispatchEvent(onNewConversation);
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }

    }

    
}
