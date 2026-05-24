import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'chat-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() metadata: any;
  @Input() width: number;
  @Input() height: number;
  @Output() onElementRendered = new EventEmitter<{element: string, status: boolean}>();

  loading: boolean = true
  hasError: boolean = false
  imageSrc: string = ''
  retryCount: number = 0
  modal: any
  span: any

  constructor() { }

  ngOnInit() {
    this.setImageSrc()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.metadata) {
      this.retryCount = 0
      this.setImageSrc()
    }
  }

  setImageSrc() {
    this.loading = true
    this.hasError = false
    this.imageSrc = this.metadata?.src || ''
  }

  onError() {
    this.loading = false
    this.hasError = true
    this.onElementRendered.emit({element: "image", status:false})
  }

  retryLoad() {
    this.retryCount++
    this.loading = true
    this.hasError = false
    const separator = this.metadata?.src?.includes('?') ? '&' : '?'
    this.imageSrc = this.metadata?.src ? `${this.metadata.src}${separator}retry=${this.retryCount}` : ''
  }

  onLoaded(event) {
    this.loading = false
    this.onElementRendered.emit({element: "image", status:true})
  }

  _downloadImage(url: string, fileName: string) {
    // console.log('Image COMP - IMAGE URL ', url) 
    // console.log('Image COMP - IMAGE FILENAME ', fileName) 
    const a: any = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  }

  openImageViewerModal(url: string, fileName: string) {
    this.modal = document.getElementById("image-viewer-modal");
    // console.log('has clicked open image-viewer modal ',  this.modal)
    this.modal.style.display = "block";
    var modalImg = <HTMLImageElement>document.getElementById("image-viewer-img");
    var captionText = document.getElementById("caption");
    modalImg.src = url
    if (captionText) {
   
      captionText.innerHTML = fileName ? fileName : decodeURIComponent(decodeURIComponent(url).split('/').pop());
      // console.log('XXXX ', decodeURIComponent(decodeURIComponent(url).split('/').pop()))
    }

  }


}


