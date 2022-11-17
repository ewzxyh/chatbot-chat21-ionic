import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'send-email-modal',
  templateUrl: './send-email.page.html',
  styleUrls: ['./send-email.page.scss'],
})
export class SendEmailModal implements OnInit {

  @Input() enableBackdropDismiss: any
  @Input() translationMap: Map<string, string>;
  @Input() msg: string;
  @Output() onSubmitForm = new EventEmitter<{}>();

  @ViewChild('div_input_topic', {static: true}) input_topic: ElementRef;
  
  emailFormGroup: FormGroup;
  private logger: LoggerService = LoggerInstance.getInstance()
  
  constructor(
    public viewCtrl: ModalController,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.logger.log('[SEND-EMAIL-MODAL] Hello!')
    this.emailFormGroup = this.buildFormGroup();
    this.emailFormGroup.valueChanges.subscribe((value)=> {
      value.subject !== ''? this.input_topic.nativeElement.classList.add('hasValue') : this.input_topic.nativeElement.classList.remove('hasValue')
    })
  }

  buildFormGroup(): FormGroup{
    return this.formBuilder.group({
      subject: ['', [Validators.required]],
      message: ['', Validators.required]
    })
  }
  async onClose() {
    this.viewCtrl.dismiss()
  }

  onSubmit(){
    this.logger.log('[SEND-EMAIL-MODAL] onSubmit -->',this.emailFormGroup.value)
    this.viewCtrl.dismiss({form: this.emailFormGroup.value})
  }

}
