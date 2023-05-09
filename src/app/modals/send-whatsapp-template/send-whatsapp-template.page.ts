import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TemplatesService } from 'src/app/services/templates/templates.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'send-whatsapp-template-modal',
  templateUrl: './send-whatsapp-template.page.html',
  styleUrls: ['./send-whatsapp-template.page.scss'],
})
export class SendWhatsappTemplateModal implements OnInit {

  @Input() enableBackdropDismiss: any
  @Input() conversationWith: string;
  @Input() projectId: string;
  @Input() translationMap: Map<string, string>;
  @Output() onSubmitForm = new EventEmitter<{}>();

  selectionView: Boolean = true;
  editTemplateView: Boolean = false;
  displayError: Boolean = false;
  labelError: string;

  selected_template: any;
  header_component: any;
  body_component: any;
  footer_component: any;
  buttons_component: any;
  header_component_temp: any;
  body_component_temp: any;
  body_params = [];
  header_params = [];
  templates = [];

  sendButtonDisabled: Boolean = true;
  display_loader: Boolean = true;

  private logger: LoggerService = LoggerInstance.getInstance()

  constructor(
    private templatesService: TemplatesService,
    public viewCtrl: ModalController
  ) { }

  ngOnInit() {
    this.logger.log('[SEND-TEMPLATE-MODAL] Hello!')
    this.getTemplates();
  }

  getTemplates() {
    this.templatesService.getTemplatesList(this.projectId).subscribe((res: Array<[]>) => {
      this.logger.debug('[SEND-TEMPLATE-MODAL] subscribe to getTemplates API response -->', res)
      //this.selectionView = true;
      this.templates = res;
      console.log("templates: ", this.templates);
    }, (error) => {
      this.logger.error('[SEND-TEMPLATE-MODAL] subscribe to getTemplates API  - ERROR  ', error)
      this.displayError = true;
      this.display_loader = false;
      if(error.error.code === '01'){
        this.labelError = this.translationMap.get('WHATSAPP.ERROR_WHATSAPP_NOT_INSTALLED')
      } else if (error.error.code === '02'){
        this.labelError = this.translationMap.get('WHATSAPP.ERROR_WHATSAPP_GENERIC_ERROR')
      }
    }, () => {
      this.display_loader = false;
      this.logger.log('[SEND-TEMPLATE-MODAL] subscribe to getTemplates API CALL /* COMPLETE */')
    })
  }

  selectTemplate(template_id) {
    this.selected_template = this.templates.find(t => t.id == template_id);
    this.logger.debug('[SEND-TEMPLATE-MODAL] Selected template -->', this.selected_template);
    this.selectionView = false;
    this.editTemplateView = true;

    this.header_component = this.selected_template.components.find(c => c.type === 'HEADER');
    this.body_component = this.selected_template.components.find(c => c.type === 'BODY');
    this.footer_component = this.selected_template.components.find(c => c.type === 'FOOTER');
    this.buttons_component = this.selected_template.components.find(c => c.type === 'BUTTONS');
    
    if (this.body_component) {
      this.body_component_temp = JSON.parse(JSON.stringify(this.body_component));
      if (this.body_component.example) {
        this.body_component.example.body_text[0].forEach((p, i) => {
          this.body_params.push({ index: i + 1, type: "text", text: null })
        })
      } else {
        this.sendButtonDisabled = false;
      }

    }

    if (this.header_component) {
      this.header_component_temp = JSON.parse(JSON.stringify(this.header_component));
      if (this.header_component.example) {
        this.header_component.example.header_text.forEach((p, i) => {
          this.header_params.push({ index: i + 1, type: "text", text: null })
        })
      } else {
        this.sendButtonDisabled = false;
      }
    }
  }

  onParamBodyChange(event, param_num) {
    this.body_component = JSON.parse(JSON.stringify(this.body_component_temp));
    this.body_params[param_num - 1].text = event;
    this.body_params.forEach((param, i) => {
      let index = i + 1;
      let regex = '{{' + index + '}}';
      if (param.text) {
        this.body_component.text = this.body_component.text.replace(regex, param.text);
      }
    })
    this.checkParameters();
  }

  onParamHeaderChange(event, param_num) {
    this.header_component = JSON.parse(JSON.stringify(this.header_component_temp));
    this.header_params[param_num - 1].text = event;
    this.header_params.forEach((param, i) => {
      let index = i + 1;
      let regex = '{{' + index + '}}';
      if (param.text) {
        this.header_component.text = this.header_component.text.replace(regex, param.text);
      }
    })
    this.checkParameters();
  }

  backToSelection() {
    this.selectionView = true;
    this.editTemplateView = false;
    this.body_params = [];
    this.header_params = [];
    this.header_component = null;
    this.body_component = null;
    this.footer_component = null;
    this.buttons_component = null;
    this.header_component_temp = null;
    this.body_component_temp = null;
  }

  sendTemplate() {
    const new_header_params = this.header_params.map(({ index, ...keepAttrs }) => keepAttrs)
    const new_body_params = this.body_params.map(({ index, ...keepAttrs }) => keepAttrs)
    let attachment = {
      type: "wa_template",
      template: {
        name: this.selected_template.name,
        language: this.selected_template.language,
        params: {
          header: new_header_params,
          body: new_body_params
        }
      }
    }

    let data = {
      attachment: attachment,
      text: this.body_component.text
    }
    this.logger.log('[SEND-TEMPLATE-MODAL] Send message with following attachment -->', data)
    this.viewCtrl.dismiss(data);
  }

  checkParameters() {
    this.sendButtonDisabled = true;
    let header_result = this.header_params.find(p => !p.text || p.text == '')
    let body_result = this.body_params.find(p => !p.text || p.text == '')
    if (!header_result && !body_result) {
      this.sendButtonDisabled = false;
    }
  }

  async onClose() {
    this.viewCtrl.dismiss()
  }

}
