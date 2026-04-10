import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@core';
import { RoleService } from './role.service';
import { Role } from './role.model';
import { RoleFormDialogComponent } from './role-form-dialog';
import { RoleAssignMenuDialogComponent } from './role-assign-menu';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './role.html',
  styleUrl: './role.scss',
})
export class RoleComponent implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  displayedColumns: string[] = ['name', 'displayName', 'description', 'defaultRoute', 'actions'];
  dataSource = new MatTableDataSource<Role>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadRoles();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (role, filter) => {
      const term = filter.trim().toLowerCase();
      return [role.name, role.displayName, role.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadRoles() {
    this.isLoading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.dataSource.data = roles;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  openRoleForm(role?: Role) {
    const dialogRef = this.dialog.open(RoleFormDialogComponent, {
      width: '500px',
      data: role ? { ...role } : null,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRoles();
        this.notify.success(role ? 'Rôle mis à jour' : 'Rôle créé');
      }
    });
  }

  deleteRole(role: Role) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'delete',
        message: 'confirm_delete',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roleService.deleteRole(role.id!).subscribe(() => {
          this.loadRoles();
          this.notify.success('Rôle supprimé');
        });
      }
    });
  }

  openAssignMenus(role: Role) {
    this.dialog.open(RoleAssignMenuDialogComponent, {
      width: '600px',
      data: role,
      disableClose: true,
    });
  }
}
