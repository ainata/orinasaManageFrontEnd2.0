import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="confirm-wrapper" [ngClass]="typeClass">
      <div class="confirm-header">
        <div class="icon-circle">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
        <h2 class="confirm-title">{{ data.title | translate }}</h2>
      </div>

      <div mat-dialog-content class="confirm-body">
        <p>{{ data.message | translate }}</p>
      </div>

      <div mat-dialog-actions class="confirm-actions">
        <button mat-button mat-dialog-close class="btn-cancel">{{ 'cancel' | translate }}</button>
        <button 
          mat-flat-button 
          class="btn-confirm"
          [mat-dialog-close]="true"
        >
          {{ 'ok' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-wrapper {
      overflow: hidden;
      border-radius: 12px;
      min-width: 320px;
    }

    .confirm-header {
      padding: 12px 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      color: white;
    }

    .icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        line-height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .confirm-title {
      margin: 0;
      padding: 0;
      font-size: 18px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }

    .confirm-body {
      padding: 24px !important;
      text-align: center;
      color: #4a5568;
      font-size: 16px;
      margin: 0 !important;
    }

    .confirm-actions {
      padding: 16px 24px 24px !important;
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 0 !important;
    }

    .btn-cancel {
      min-width: 100px;
      color: #718096;
    }

    .btn-confirm {
      min-width: 100px;
      border-radius: 6px;
    }

    /* Types Styling - Matches Toastr */
    .confirm-wrapper.danger {
      .confirm-header { background-color: #d64545; }
      .btn-confirm { background-color: #d64545; color: white; }
    }

    .confirm-wrapper.warning {
      .confirm-header { background-color: #e6a700; color: #1f2328; }
      .icon-circle { background: rgba(0, 0, 0, 0.1); }
      .btn-confirm { background-color: #e6a700; color: #1f2328; }
    }

    .confirm-wrapper.info {
      .confirm-header { background-color: #2c7be5; }
      .btn-confirm { background-color: #2c7be5; color: white; }
    }

    .confirm-wrapper.success {
      .confirm-header { background-color: #1f9d55; }
      .btn-confirm { background-color: #1f9d55; color: white; }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}

  get typeClass(): string {
    return this.data.type || 'info';
  }

  get icon(): string {
    switch (this.data.type) {
      case 'danger': return 'report';
      case 'warning': return 'warning';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }
}
