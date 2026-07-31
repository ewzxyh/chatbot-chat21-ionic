import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameComponent } from './frame.component';

describe('FrameComponent', () => {
  let component: FrameComponent;
  let fixture: ComponentFixture<FrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders video metadata with the native player instead of an iframe', () => {
    component.metadata = { type: 'video/mp4', src: 'video.mp4' };
    component.setFrameUrl();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('video')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('iframe')).toBeFalsy();
  });
});
