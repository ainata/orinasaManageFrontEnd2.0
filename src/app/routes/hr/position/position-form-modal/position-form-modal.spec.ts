import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionFormModal } from './position-form-modal';

describe('PositionFormModal', () => {
  let component: PositionFormModal;
  let fixture: ComponentFixture<PositionFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
