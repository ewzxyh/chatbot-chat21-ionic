import { DomSanitizer } from '@angular/platform-browser';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'chat-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

  @Input() metadata: any;
  @Input() width: number;
  @Input() height: number;
  @Output() onElementRendered = new EventEmitter<{element: string, status: boolean}>();
  
  url: any;
  loading: boolean = true
  hasError: boolean = false
  retryCount: number = 0
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
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.metadata.src);
    }
  }
  
  ngOnDestroy(){
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
    this.url = retryUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(retryUrl) : null
  }


}
