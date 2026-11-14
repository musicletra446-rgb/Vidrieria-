import React, { useState } from 'react';
import { InventoryItem, InventoryMovement, ProductCategory } from '../types/logistics';
import { formatCOP } from '../utils/logisticsCalculations';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  History,
  FileSpreadsheet,
  AlertOctagon,
  Layers,
  Sparkles,
} from 'lucide-react';

interface InventoryModuleProps {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  onOpenMovementModal: (item?: InventoryItem) => void;
  onQuickAdjust: (itemId: string, delta: number, reason: 'Entrada' | 'Salida' | 'Merma') => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  inventory,
  movements,
  onOpenMovementModal,
  onQuickAdjust,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'tabla' | 'kardex'>('tabla');

  const categories: string[] = [
    'Todas',
    'Láminas de Vidrio',
    'Mesas de Vidrio',
    'Espejos',
    'Cuadros',
    'Ventanas',
  ];

  // Filtrado de inventario
  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specifications.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !showLowStockOnly || item.stock <= item.minStock;
    return matchesCategory && matchesSearch && matchesLowStock;
  });

  const totalValuationCOP = inventory.reduce(
    (acc, item) => acc + item.stock * item.unitCostCOP,
    0
  );

  const totalRetailValueCOP = inventory.reduce(
    (acc, item) => acc + item.stock * item.unitPriceCOP,
    0
  );

  const lowStockCount = inventory.filter((i) => i.stock <= i.minStock).length;

  return (
    <div className="space-y-6">
      {/* Header Teórico Ronald H. Ballou */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wide">
              <span>Módulo 2</span>
              <span>·</span>
              <span>Fundamento Teórico: Ronald H. Ballou (Business Logistics Management)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Control de Inventarios en Tiempo Real (Kardex & Stock)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Según <strong>Ronald H. Ballou</strong>, la gestión eficaz de inventarios busca el equilibrio exacto entre el costo de mantener inventario y el costo de quiebre de stock (faltantes). En el negocio del vidrio, este control abarca tanto la materia prima (láminas de calibres variados) como los productos de alto valor agregado (mesas templadas, ventanas y espejos).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenMovementModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Movimiento de Kardex</span>
            </button>
          </div>
        </div>

        {/* Barra de Totales Financieros */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 uppercase">Costo Total de Inventario</span>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {formatCOP(totalValuationCOP)}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 uppercase">Valor Estimado de Venta</span>
            <div className="text-lg font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
              {formatCOP(totalRetailValueCOP)}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 uppercase">Alertas de Stock Mínimo (Ballou)</span>
            <div className="text-lg font-bold font-mono text-amber-700 tabular-nums mt-0.5">
              {lowStockCount} referencias bajo punto crítico
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Sub-pestañas: Tabla General vs Historial Kardex */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveSubTab('tabla')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'tabla'
                ? 'border-blue-700 text-blue-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventario de Productos & Láminas ({inventory.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('kardex')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'kardex'
                ? 'border-blue-700 text-blue-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial de Movimientos / Kardex ({movements.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'tabla' ? (
        <div className="space-y-4">
          {/* Barra de Filtros & Búsqueda */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Categorías */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Búsqueda y Switch de Stock Bajo */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar referencia o calibre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>

              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  showLowStockOnly
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Solo Stock Bajo ({lowStockCount})</span>
              </button>
            </div>
          </div>

          {/* Tabla Dinámica de Inventario */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">SKU / Referencia</th>
                    <th className="py-3 px-4">Descripción & Calibre</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4 text-center">Ubicación Bodega</th>
                    <th className="py-3 px-4 text-right">Existencias</th>
                    <th className="py-3 px-4 text-right">Stock Mínimo</th>
                    <th className="py-3 px-4 text-right">Costo Unit. (COP)</th>
                    <th className="py-3 px-4 text-right">Valor Total (COP)</th>
                    <th className="py-3 px-4 text-center">Estado Ballou</th>
                    <th className="py-3 px-4 text-center">Ajuste Inmediato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No se encontraron productos que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isCritical = item.stock <= item.safetyStock;
                      const isLow = item.stock <= item.minStock && !isCritical;
                      const totalItemValue = item.stock * item.unitCostCOP;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                            {item.sku}
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {item.specifications}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                            {item.category}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap text-slate-600 font-medium">
                            {item.location}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                              {item.stock}
                            </span>{' '}
                            <span className="text-slate-500 text-[11px]">{item.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums text-slate-600">
                            {item.minStock} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums text-slate-700">
                            {formatCOP(item.unitCostCOP)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold tabular-nums text-slate-900">
                            {formatCOP(totalItemValue)}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {isCritical ? (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold text-rose-800 bg-rose-50 border border-rose-200">
                                <AlertOctagon className="w-3 h-3" />
                                Crítico (≤ SS)
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                                <AlertTriangle className="w-3 h-3" />
                                Reordenar
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded font-medium text-emerald-800 bg-emerald-50 border border-emerald-200">
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onQuickAdjust(item.id, 1, 'Entrada')}
                                className="p-1 rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 transition-colors border border-slate-200"
                                title="Ingresar +1 lámina/unidad"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onQuickAdjust(item.id, -1, 'Salida')}
                                disabled={item.stock <= 0}
                                className="p-1 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors border border-slate-200 disabled:opacity-30"
                                title="Despachar/Consumir -1 unidad"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onQuickAdjust(item.id, -1, 'Merma')}
                                disabled={item.stock <= 0}
                                className="p-1 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-800 text-slate-700 transition-colors border border-slate-200 disabled:opacity-30"
                                title="Registrar rotura/merma (-1)"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Sub-pestaña: Historial Kardex de Ronald H. Ballou */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Libro Mayor de Movimientos (Kardex Físico)
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Control de trazabilidad para auditoría de mermas y ventas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Material / Producto</th>
                  <th className="py-3 px-4 text-center">Tipo</th>
                  <th className="py-3 px-4 text-right">Cantidad</th>
                  <th className="py-3 px-4">Motivo Operativo</th>
                  <th className="py-3 px-4">Documento Soporte</th>
                  <th className="py-3 px-4">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {movements.map((mov) => {
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {mov.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {mov.itemName}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded ${
                            mov.type === 'Entrada'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : mov.type === 'Salida'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                        {mov.type === 'Entrada' ? `+${mov.quantity}` : `-${mov.quantity}`}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {mov.reason}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {mov.referenceDoc}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {mov.responsible}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
