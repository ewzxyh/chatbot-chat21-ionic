import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'chat-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit {

  @ViewChild('audioElement', { static: true }) audioElement!: ElementRef<HTMLAudioElement>;

  @Input() metadata: any | null = null;
  @Input() audioBlob: Blob | null = null;
  @Input() color: string;
  @Input() fontSize: string;
  @Input() stylesMap: Map<string, string>;
  @Output() onElementRendered = new EventEmitter<{element: string, status: boolean}>();

  audioUrl: SafeUrl | null = null;
  rawAudioUrl: string | null = null;
  audioDuration: number = 0;
  currentTime: number = 0;
  seekValue: number = 0;
  isPlaying: boolean = false;
  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.audioBlob) {
      this.rawAudioUrl = URL.createObjectURL(this.audioBlob);
    } else {
      this.rawAudioUrl = this.metadata?.src || '';
    }
    this.audioUrl = this.rawAudioUrl ? this.sanitizer.bypassSecurityTrustUrl(this.rawAudioUrl) : null;
  }

  ngOnDestroy() {
    if (this.audioBlob && this.rawAudioUrl) {
      URL.revokeObjectURL(this.rawAudioUrl);
    }
  }

  onLoadedMetadata() {
    const audio = this.audioElement.nativeElement;
    this.audioDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    this.isLoading = false;
    this.hasError = false;
    this.onElementRendered.emit({element: 'audio', status: true});
  }

  onTimeUpdate() {
    const audio = this.audioElement.nativeElement;
    this.currentTime = audio.currentTime || 0;
    this.seekValue = this.audioDuration ? (this.currentTime / this.audioDuration) * 100 : 0;
  }

  onAudioEnded() {
    this.isPlaying = false;
    this.currentTime = 0;
    this.seekValue = 0;
  }

  onAudioError() {
    this.isLoading = false;
    this.hasError = true;
    this.isPlaying = false;
    this.onElementRendered.emit({element: 'audio', status: false});
  }

  playPauseAudio() {
    const audio = this.audioElement.nativeElement;
    if (audio.paused) {
      audio.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch(() => this.onAudioError());
    } else {
      audio.pause();
      this.isPlaying = false;
    }
  }

  seekAudio(event) {
    const audio = this.audioElement.nativeElement;
    const value = Number(event?.target?.value || 0);
    this.seekValue = value;
    if (this.audioDuration) {
      audio.currentTime = (value / 100) * this.audioDuration;
      this.currentTime = audio.currentTime;
    }
  }

  retryLoad() {
    this.isLoading = true;
    this.hasError = false;
    const audio = this.audioElement.nativeElement;
    audio.load();
  }

  formatTime(seconds: number): string {
    const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const sec = Math.floor(safeSeconds % 60);
    return `${minutes}:${sec < 10 ? '0' + sec : sec}`;
  }

}
