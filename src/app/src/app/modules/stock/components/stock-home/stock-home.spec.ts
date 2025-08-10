import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockHome } from './stock-home';

describe('StockHome', () => {
  let component: StockHome;
  let fixture: ComponentFixture<StockHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
