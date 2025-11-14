import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterGuideComponent } from './water-guide.component';

describe('WaterGuideComponent', () => {
  let component: WaterGuideComponent;
  let fixture: ComponentFixture<WaterGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
