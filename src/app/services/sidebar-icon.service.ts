import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SidebarIconService {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) { }

  registerIcons(): void {
    this.addTablerIcon('td-activity', 'activity');
    this.addTablerIcon('td-address-book', 'address-book');
    this.addTablerIcon('td-alert-triangle', 'alert-triangle');
    this.addTablerIcon('td-apps', 'apps');
    this.addTablerIcon('td-brain', 'brain');
    this.addTablerIcon('td-brand-whatsapp', 'brand-whatsapp');
    this.addTablerIcon('td-chart-bar', 'chart-bar');
    this.addTablerIcon('td-chevron-down', 'chevron-down');
    this.addTablerIcon('td-circle-plus', 'circle-plus');
    this.addTablerIcon('td-clipboard-list', 'clipboard-list');
    this.addTablerIcon('td-clock', 'clock');
    this.addTablerIcon('td-dots-vertical', 'dots-vertical');
    this.addTablerIcon('td-external-link', 'external-link');
    this.addTablerIcon('td-git-branch', 'git-branch');
    this.addTablerIcon('td-history', 'history');
    this.addTablerIcon('td-home', 'home');
    this.addTablerIcon('td-lifebuoy', 'lifebuoy');
    this.addTablerIcon('td-list', 'list');
    this.addTablerIcon('td-logout', 'logout');
    this.addTablerIcon('td-message', 'message');
    this.addTablerIcon('td-phone', 'phone');
    this.addTablerIcon('td-player-play', 'player-play');
    this.addTablerIcon('td-plus', 'plus');
    this.addTablerIcon('td-settings', 'settings');
    this.addTablerIcon('td-shield-cog', 'shield-cog');
    this.addTablerIcon('td-volume', 'volume');
  }

  private addTablerIcon(name: string, fileName: string): void {
    this.matIconRegistry.addSvgIcon(
      name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/tabler/${fileName}.svg`)
    );
  }
}
