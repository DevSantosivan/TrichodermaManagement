import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemidersAdminComponent } from './remiders-admin.component';

describe('RemidersAdminComponent', () => {
  let component: RemidersAdminComponent;
  let fixture: ComponentFixture<RemidersAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemidersAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemidersAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
