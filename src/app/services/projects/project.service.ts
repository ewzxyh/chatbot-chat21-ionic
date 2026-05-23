import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Project } from 'src/chat21-core/models/projects';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { AppConfigProvider } from '../app-config';
import { Observable } from 'rxjs';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private SERVER_BASE_URL: string;
  private tiledeskToken: string;
  private _project: Project;

  private logger: LoggerService = LoggerInstance.getInstance();


  
  constructor(
    public http: HttpClient,
    public appStorageService: AppStorageService,
    public appConfigProvider: AppConfigProvider
  ) {
   
    this.logger.log('[PROJECTS-SERVICE] HELLO !');
  }

  initialize(serverBaseUrl: string) {
    this.logger.log('[TILEDESK-PROJECTS-SERV] - initialize serverBaseUrl', serverBaseUrl);
    this.SERVER_BASE_URL = serverBaseUrl;
    this.tiledeskToken = this.appStorageService.getItem('tiledeskToken')
  }

  private getHttpOptions() {
    this.tiledeskToken = this.tiledeskToken || this.appStorageService.getItem('tiledeskToken') || localStorage.getItem('tiledesk_token') || '';
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.tiledeskToken) {
      headers = headers.set('Authorization', this.tiledeskToken);
    }

    return { headers };
  }

  private getServerBaseUrl(): string {
    if (!this.SERVER_BASE_URL) {
      const appConfig = this.appConfigProvider.getConfig();
      this.SERVER_BASE_URL = appConfig && appConfig.apiUrl ? appConfig.apiUrl : '';
    }

    return this.SERVER_BASE_URL;
  }

  public getProjects(): Observable<Project[]> {
    const url = this.getServerBaseUrl()  + "projects/";
    this.logger.log('[PROJECTS-SERVICE] getProjects - URL ', url);

    const httpOptions = this.getHttpOptions();
    
    return this.http.get(url, httpOptions).pipe(map((res: Project[]) => {
        this.logger.log('[PROJECTS-SERVICE] getProjects - RES ', res);
        return res
    }))
  }

  public getProjectById(id: string): Observable<Project> {
    const url = this.getServerBaseUrl() + 'projects/' + id;
    this.logger.log('[TILEDESK-SERVICE] - GET PROJECT BY ID URL', url);

    const httpOptions = this.getHttpOptions();
    return this.http.get(url, httpOptions).pipe(map((project: Project) => {
      this.logger.log('[TILEDESK-SERVICE] GET PROJECT BY ID URL - RES ', project);
      this._project = project;
      return project
    }))
  }

  /**
   * Get the current project
   * @returns The current project
   */
  public getProject(): Project {
    return this._project;
  }

  /**
   * Set the current project
   * @param project The project to set
   */
  public setProject(project: Project): void {
    this._project = project;
    this.logger.log('[PROJECTS-SERVICE] setProject - Project set: ', this._project);
  }

}
