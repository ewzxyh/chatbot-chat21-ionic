import { DomSanitizer } from '@angular/platform-browser';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'chat-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement>;
  @Input() metadata: any;
  @Input() width: number;
  @Input() height: number;
  @Output() onElementRendered = new EventEmitter<{element: string, status: boolean}>();
  
  url: any;
  mediaUrl: string;
  loading: boolean = true
  hasError: boolean = false
  retryCount: number = 0
  private videoPlaybackAllowedAt = 0
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.setFrameUrl()
    // this.width = this.getSizeImg(this.metadata).width;
    // this.height = this.getSizeImg(this.metadata).height;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.metadata) {
      this.retryCount = 0
      this.setFrameUrl()
    }
  }

  setFrameUrl() {
    this.loading = true
    this.hasError = false
    if(this.metadata && this.metadata.src){
      this.mediaUrl = this.metadata.src;
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.metadata.src);
    }
  }

  get isVideo(): boolean {
    return this.metadata?.type?.startsWith('video/');
  }

  allowVideoPlayback() {
    this.videoPlaybackAllowedAt = Date.now();
  }

  onVideoPlay(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (Date.now() - this.videoPlaybackAllowedAt < 1500) {
      this.videoPlaybackAllowedAt = 0;
      return;
    }
    video.pause();
    video.currentTime = 0;
  }
  
  ngOnDestroy(){
    const video = this.videoElement?.nativeElement;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    this.mediaUrl = null;
    this.url = null;
  }

  onLoaded(event){
    this.loading = false
    this.onElementRendered.emit({element: "image", status:true})
  }

  onError(){
    this.loading = false
    this.hasError = true
    this.onElementRendered.emit({element: "frame", status:false})
  }

  retryLoad(){
    this.retryCount++
    this.loading = true
    this.hasError = false
    const separator = this.metadata?.src?.includes('?') ? '&' : '?'
    const retryUrl = this.metadata?.src ? `${this.metadata.src}${separator}retry=${this.retryCount}` : ''
    this.mediaUrl = retryUrl;
    this.url = retryUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(retryUrl) : null
  }


}
