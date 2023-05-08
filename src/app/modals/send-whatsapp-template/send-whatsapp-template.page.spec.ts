import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SendWhatsappTemplatePage } from './send-whatsapp-template.page';

describe('SendWhatsappTemplatePage', () => {
  let component: SendWhatsappTemplatePage;
  let fixture: ComponentFixture<SendWhatsappTemplatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendWhatsappTemplatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SendWhatsappTemplatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
