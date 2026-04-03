import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  OnInit,
  signal,
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
import { forkJoin } from 'rxjs';
import { PositionService } from '../position.service';
import { ActivityService } from '../../activity/activity.service';
import { DepartmentService } from '../../department/department.service';
import { AuthService } from '@core/authentication';
import { Position } from '../position.model';
import { Activity } from '../../activity/activity.model';
import { Department } from '../../department/department.model';
import { PositionFormModal } from '../position-form-modal/position-form-modal';

interface ActivityGroupWithPositions {
  department: Department;
  activity: Activity;
  dataSource: MatTableDataSource<Position>;
}

@Component({
  selector: 'app-position-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule,
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
  templateUrl: './position-list.html',
  styleUrls: ['./position-list.scss'],
})
export class PositionList implements OnInit {
  private readonly positionService = inject(PositionService);
  private readonly activityService = inject(ActivityService);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly activityGroups = signal<ActivityGroupWithPositions[]>([]);
  readonly globalFilter = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  readonly displayedColumns: string[] = ['id', 'name', 'code', 'description', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  private readonly positionFilterPredicate = (data: Position, filter: string): boolean => {
    const f = filter.trim().toLowerCase();
    const blob = [data.name, data.code ?? '', data.description ?? ''].join(' ').toLowerCase();
    return blob.includes(f);
  };

  loadData(): void {
    const companyId = this.authService.companyId;
    if (!companyId) return;

    this.isLoading.set(true);

    this.departmentService
      .getDepartments(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(departments => {
        if (departments.length === 0) {
          this.activityGroups.set([]);
          this.isLoading.set(false);
          return;
        }

        const activityRequests = departments.map(d =>
          this.activityService.getActivitiesByDepartment(d.id)
        );

        forkJoin(activityRequests)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(activitiesPerDept => {
            const flat: { department: Department; activity: Activity }[] = [];
            departments.forEach((dept, i) => {
              activitiesPerDept[i].forEach(activity => {
                flat.push({ department: dept, activity });
              });
            });

            if (flat.length === 0) {
              this.activityGroups.set([]);
              this.isLoading.set(false);
              return;
            }

            const positionRequests = flat.map(({ activity }) =>
              this.positionService.getPositionsByActivity(activity.id)
            );

            forkJoin(positionRequests)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(positionsPerActivity => {
                const filterVal = this.globalFilter();
                const groups: ActivityGroupWithPositions[] = flat.map((ctx, index) => {
                  const ds = new MatTableDataSource<Position>(positionsPerActivity[index]);
                  ds.filterPredicate = this.positionFilterPredicate;
                  ds.filter = filterVal;
                  return { ...ctx, dataSource: ds };
                });
                this.activityGroups.set(groups);
                this.isLoading.set(false);
              });
          });
      });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.globalFilter.set(value);
    this.activityGroups().forEach(group => {
      group.dataSource.filter = value;
    });
  }

  addPosition(): void {
    const dialogRef = this.dialog.open(PositionFormModal);
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  edit(position: Position): void {
    const dialogRef = this.dialog.open(PositionFormModal, { data: position });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  delete(id: number): void {
    this.positionService
      .deletePosition(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadData());
  }

}
