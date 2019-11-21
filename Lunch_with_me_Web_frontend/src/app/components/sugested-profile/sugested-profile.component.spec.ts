import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SugestedProfileComponent } from './sugested-profile.component';

describe('SugestedProfileComponent', () => {
  let component: SugestedProfileComponent;
  let fixture: ComponentFixture<SugestedProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SugestedProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SugestedProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
