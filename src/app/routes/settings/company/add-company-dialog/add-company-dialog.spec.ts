import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompanyDialog } from './add-company-dialog';

describe('AddCompanyDialog', () => {
  let component: AddCompanyDialog;
  let fixture: ComponentFixture<AddCompanyDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCompanyDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCompanyDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
