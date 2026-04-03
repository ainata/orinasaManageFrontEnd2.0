import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PositionFormModal } from './position-form-modal';
import { AuthService } from '@core/authentication';

describe('PositionFormModal', () => {
  let component: PositionFormModal;
  let fixture: ComponentFixture<PositionFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionFormModal, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: AuthService, useValue: { companyId: 1 } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PositionFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
