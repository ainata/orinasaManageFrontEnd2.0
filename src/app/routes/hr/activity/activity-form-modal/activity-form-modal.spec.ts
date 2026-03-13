import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityFormModal } from './activity-form-modal';

describe('ActivityFormModal', () => {
  let component: ActivityFormModal;
  let fixture: ComponentFixture<ActivityFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
