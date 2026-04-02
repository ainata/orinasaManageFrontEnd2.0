import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeader } from '@shared';
import { ActivityService } from '../activity.service';
import { DepartmentService } from '../../department/department.service';
import { AuthService } from '@core/authentication';
import { Activity } from '../activity.model';
import { Department } from '../../department/department.model';
import { ActivityFormModal } from '../activity-form-modal/activity-form-modal';
import { forkJoin } from 'rxjs';

interface DepartmentWithActivities {
  department: Department;
  dataSource: MatTableDataSource<Activity>;
}

@Component({
  selector: 'app-activity-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule,
    PageHeader,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatExpansionModule,
  ],
  templateUrl: './activity-list.html',
  styleUrls: ['./activity-list.scss'],
})
export class ActivityList implements OnInit {
  private readonly activityService = inject(ActivityService);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly departmentGroups = signal<DepartmentWithActivities[]>([]);
  readonly globalFilter = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  readonly displayedColumns: string[] = ['id', 'name', 'code', 'description', 'actions'];

  // Computed : nombre total d'activités visible dans le template
  readonly totalActivities = computed(() =>
    this.departmentGroups().reduce((sum, g) => sum + g.dataSource.filteredData.length, 0)
  );

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const companyId = this.authService.companyId;
    if (!companyId) return;

    this.isLoading.set(true);

    this.departmentService
      .getDepartments(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(departments => {
        const requests = departments.map(dept =>
          this.activityService.getActivitiesByDepartment(dept.id)
        );

        forkJoin(requests)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(activitiesPerDept => {
            const groups = departments.map((dept, index) => {
              const ds = new MatTableDataSource<Activity>(activitiesPerDept[index]);
              ds.filter = this.globalFilter();
              return { department: dept, dataSource: ds };
            });

            this.departmentGroups.set(groups);
            this.isLoading.set(false);
          });
      });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.globalFilter.set(value);

    // Propager le filtre sur chaque MatTableDataSource
    this.departmentGroups().forEach(group => {
      group.dataSource.filter = value;
    });
  }

  addActivity(): void {
    const dialogRef = this.dialog.open(ActivityFormModal);
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  edit(activity: Activity): void {
    const dialogRef = this.dialog.open(ActivityFormModal, { data: activity });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  delete(id: number): void {
    this.activityService
      .deleteActivity(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadData());
  }

  trackByDept(_: number, group: DepartmentWithActivities): number {
    return group.department.id;
  }
}
