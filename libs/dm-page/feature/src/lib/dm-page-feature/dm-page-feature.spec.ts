import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DmPageFeature } from './dm-page-feature';

describe('DmPageFeature', () => {
  let component: DmPageFeature;
  let fixture: ComponentFixture<DmPageFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmPageFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(DmPageFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
