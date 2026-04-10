import { Component, Inject, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { RoleService } from './role.service';
import { MenuManagementService } from './menu-management.service';
import { Role, BackendMenu } from './role.model';
import { NotificationService } from '@core';

@Component({
  selector: 'app-role-assign-menu-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Assigner des menus : {{ data.displayName }}</h2>
      </div>

      <div mat-dialog-content class="dialog-content min-h-[400px]">
        @if (isLoading()) {
          <div class="flex justify-center items-center py-10">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div class="p-4 bg-gray-50 border-b text-sm text-gray-500">
            <mat-icon inline class="mr-1 align-middle">info</mat-icon>
            Sélectionnez les menus accessibles pour ce rôle.
          </div>
          
          <mat-selection-list #menuList class="menu-selection-list">
            @for (menu of allMenus(); track menu.id) {
              <mat-list-option [value]="menu.id" [selected]="isMenuSelected(menu.id)" class="parent-menu">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-blue-500">{{ menu.icon || 'link' }}</mat-icon>
                  <div class="flex flex-col">
                    <span class="font-medium">{{ menu.title }}</span>
                  </div>
                </div>
              </mat-list-option>
              @if (menu.children && menu.children.length > 0) {
                @for (child of menu.children; track child.id) {
                  <mat-list-option [value]="child.id" [selected]="isMenuSelected(child.id)" class="child-menu ml-8">
                    <div class="flex items-center gap-3">
                      <mat-icon class="text-gray-400 text-sm">subdirectory_arrow_right</mat-icon>
                      <span class="text-sm">{{ child.title }}</span>
                    </div>
                  </mat-list-option>
                }
              }
            }
          </mat-selection-list>
        }
      </div>

      <div mat-dialog-actions class="dialog-footer">
        <button mat-stroked-button mat-dialog-close [disabled]="isSaving()">{{ 'cancel' | translate }}</button>
        <button mat-flat-button color="accent" [disabled]="isLoading() || isSaving()" (click)="save()">
           @if (isSaving()) {
            <mat-spinner diameter="18" class="mr-2 inline"></mat-spinner>
          }
          {{ 'save' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .menu-selection-list {
      max-height: 500px;
      overflow-y: auto;
    }
    .parent-menu {
      background: rgba(0,0,0,0.02);
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .child-menu {
      border-bottom: 1px solid rgba(0,0,0,0.03);
    }
    mat-dialog-content {
      padding: 0 !important;
    }
  `]
})
export class RoleAssignMenuDialogComponent implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly menuMgtService = inject(MenuManagementService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<RoleAssignMenuDialogComponent>);

  @ViewChild('menuList') menuList!: MatSelectionList;

  allMenus = signal<BackendMenu[]>([]);
  assignedMenuIds = signal<number[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data: Role) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    forkJoin({
      all: this.menuMgtService.getMenusByCompany(),
      assigned: this.roleService.getMenusByRole(this.data.id!)
    }).subscribe({
      next: (res) => {
        this.allMenus.set(res.all);
        this.assignedMenuIds.set(res.assigned.map(m => m.id));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  isMenuSelected(menuId: number): boolean {
    return this.assignedMenuIds().includes(menuId);
  }

  save() {
    const selectedIds = this.menuList.selectedOptions.selected.map(option => option.value);
    
    this.isSaving.set(true);
    this.roleService.assignMenus(this.data.id!, selectedIds).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notificationService.success('Menus assignés avec succès');
        this.dialogRef.close(true);
      },
      error: () => this.isSaving.set(false)
    });
  }
}
