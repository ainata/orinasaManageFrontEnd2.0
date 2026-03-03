import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { SettingsService } from '@core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-translate',
  standalone: true,
  template: `
    <!-- Bouton principal -->
    <button mat-icon-button [matMenuTriggerFor]="menu">
      <img [src]="getFlag(options.language)" width="26" height="26" class="rounded-circle border" />
    </button>

    <!-- Menu -->
    <mat-menu #menu="matMenu">
      @for (lang of langs; track lang.value) {
        <button mat-menu-item (click)="changeLang(lang.value)">
          <div class="d-flex align-items-center justify-content-between w-100">
            <!-- Flag + label -->
            <div class="d-flex align-items-center gap-2">
              <img [src]="lang.flag" width="22" height="22" class="rounded-circle border" />
              <span>{{ lang.name | translate }}</span>
            </div>

            <!-- Check -->
            @if (lang.value === options.language) {
              <mat-pseudo-checkbox state="checked" appearance="minimal" />
            }
          </div>
        </button>
      }
    </mat-menu>
  `,
  imports: [MatButtonModule, MatMenuModule, MatPseudoCheckbox, TranslatePipe],
})
export class TranslateButton {
  private settings = inject(SettingsService);

  options = this.settings.options;

  langs = [
    {
      value: 'en-US',
      name: 'English',
      flag: 'images/flags/en.png',
    },
    {
      value: 'fr-FR',
      name: 'Français',
      flag: 'images/flags/fr.jpg',
    },
  ];

  changeLang(lang: string) {
    this.settings.setLanguage(lang);
  }

  getFlag(lang: string): string {
    const found = this.langs.find(l => l.value === lang);

    return found ? found.flag : 'images/flags/en.png';
  }
}
