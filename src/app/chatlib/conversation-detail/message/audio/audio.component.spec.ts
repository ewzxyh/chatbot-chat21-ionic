import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioComponent } from './audio.component';

describe('AudioComponent', () => {
  let component: AudioComponent;
  let fixture: ComponentFixture<AudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should stop and release the audio element when destroyed', () => {
    const audio = component.audioElement.nativeElement;
    const pauseSpy = spyOn(audio, 'pause');
    const loadSpy = spyOn(audio, 'load');
    const removeAttributeSpy = spyOn(audio, 'removeAttribute').and.callThrough();
    audio.currentTime = 5;

    component.ngOnDestroy();

    expect(pauseSpy).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
    expect(removeAttributeSpy).toHaveBeenCalledWith('src');
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should reject playback that was not requested by the play button', () => {
    const audio = component.audioElement.nativeElement;
    const pauseSpy = spyOn(audio, 'pause');
    audio.currentTime = 5;

    component.onAudioPlay();

    expect(pauseSpy).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
    expect(component.isPlaying).toBe(false);
  });

  it('should attach the audio source only after the play button is used', () => {
    const audio = component.audioElement.nativeElement;
    const loadSpy = spyOn(audio, 'load');
    spyOn(audio, 'play').and.returnValue(Promise.resolve());
    component.rawAudioUrl = 'https://example.com/message.ogg';

    expect(audio.getAttribute('src')).toBeNull();

    component.playPauseAudio();

    expect(audio.getAttribute('src')).toBe('https://example.com/message.ogg');
    expect(loadSpy).toHaveBeenCalled();
  });
});
