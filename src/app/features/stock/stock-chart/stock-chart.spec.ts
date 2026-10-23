import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockChartComponent } from './stock-chart';

describe('StockChartComponent', () => {
  let component: StockChartComponent;
  let fixture: ComponentFixture<StockChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StockChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
