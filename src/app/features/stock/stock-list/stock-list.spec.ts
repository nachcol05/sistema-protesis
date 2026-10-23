import { StockItem } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { FirebaseStorageService } from '../../../core/services/firebase-storage.service';
import { ProtesisService } from '../../../core/services/protesis.service';
import { StockListComponent } from './stock-list.component';

describe('StockList', () => {
  let component: StockListComponent;

  beforeEach(() => {
    component = new StockListComponent(
      {} as AuthService,
      {} as ProtesisService,
      {} as FirebaseStorageService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters products with stock of five units or less', () => {
    component.protesis = [
      { nombreProducto: 'Pierna', tipoProtesis: 'Pierna', cantidad: 5 } as StockItem,
      { nombreProducto: 'Cabeza', tipoProtesis: 'Cabeza', cantidad: 6 } as StockItem,
    ];
    component.soloStockBajo = true;

    expect(component.protesisFiltradas.map((item) => item.nombreProducto)).toEqual(['Pierna']);
  });

  it('marks dates only when they are more than five years old', () => {
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);
    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

    expect(component.vencimientoSuperaCincoAnios(sixYearsAgo)).toBe(true);
    expect(component.vencimientoSuperaCincoAnios(fourYearsAgo)).toBe(false);
  });
});
