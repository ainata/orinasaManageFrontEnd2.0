import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesDetails } from './employees-details';

describe('EmployeesDetails', () => {
  let component: EmployeesDetails;
  let fixture: ComponentFixture<EmployeesDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
