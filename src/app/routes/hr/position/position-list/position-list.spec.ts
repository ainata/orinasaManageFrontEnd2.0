import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PositionList } from './position-list';
import { AuthService } from '@core/authentication';

describe('PositionList', () => {
  let component: PositionList;
  let fixture: ComponentFixture<PositionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionList, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: { companyId: 1 } }],
    }).compileComponents();

    fixture = TestBed.createComponent(PositionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
