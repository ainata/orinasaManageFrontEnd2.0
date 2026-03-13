import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentFormModal } from './department-form-modal';

describe('DepartmentFormModal', () => {
  let component: DepartmentFormModal;
  let fixture: ComponentFixture<DepartmentFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
