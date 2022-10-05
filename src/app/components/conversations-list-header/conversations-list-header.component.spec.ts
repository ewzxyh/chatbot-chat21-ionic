import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConversationsListHeader } from './conversations-list-header.component';

describe('ConversationsListHeader', () => {
  let component: ConversationsListHeader;
  let fixture: ComponentFixture<ConversationsListHeader>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationsListHeader ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationsListHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
