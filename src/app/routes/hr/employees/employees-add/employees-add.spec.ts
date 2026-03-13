import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesAdd } from './employees-add';

describe('EmployeesAdd', () => {
  let component: EmployeesAdd;
  let fixture: ComponentFixture<EmployeesAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
