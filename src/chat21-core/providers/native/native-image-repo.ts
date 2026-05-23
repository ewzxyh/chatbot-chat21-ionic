import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class NativeImageRepoService extends ImageRepoService {
    
    private baseImageURL: string;
    
    constructor(public http: HttpClient) {
        super();
    }

    /**
     * @param uid
     */
    getImagePhotoUrl(uid: string): string {
        return ''
    } 

    checkImageExists(url: string, callback: (exist: boolean) => void): void {
        this.http.get(url).subscribe( res => {
            callback(true)
        },(error) => { console.log('errorrrrrr', url, error);callback(false)})
    }

}
