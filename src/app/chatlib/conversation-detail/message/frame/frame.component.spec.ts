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

    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    spyOn(video, 'pause');
    video.currentTime = 5;
    component.onVideoPlay({ target: video } as any);

    expect(video).toBeTruthy();
    expect(fixture.nativeElement.querySelector('iframe')).toBeFalsy();
    expect(video.pause).toHaveBeenCalled();
    expect(video.currentTime).toBe(0);
  });
});
