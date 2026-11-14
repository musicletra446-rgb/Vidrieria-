import React, { useState } from 'react';
import { InventoryItem, Supplier, ReorderRecommendation, PurchaseOrder } from '../types/logistics';
import { calculateChopraReplenishment, formatCOP } from '../utils/logisticsCalculations';
import {
  ShoppingCart,
  TrendingDown,
  Building2,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  Plus,
  FileText,
  Truck,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface ReplenishmentModuleProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  onGeneratePurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'date'>) => void;
  onReceivePurchaseOrder: (poId: string, items: { itemId: string; quantity: number }[]) => void;
  existingPOs: PurchaseOrder[];
}

export const ReplenishmentModule: React.FC<ReplenishmentModuleProps> = ({
  inventory,
  suppliers,
  onGeneratePurchaseOrder,
  onReceivePurchaseOrder,
  existingPOs,
}) => {
  const recommendations: ReorderRecommendation[] = calculateChopraReplenishment(inventory, suppliers);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0].id);
  const [selectedItemsToOrder, setSelectedItemsToOrder] = useState<Record<string, number>>({});
  const [orderNotes, setOrderNotes] = useState<string>('Despacho directo a bodega de Vidriería La Primera en Buga.');

  // Pre-cargar cantidades recomendadas para artículos con urgencia crítica o media
  const handleAutoFillRecommended = () => {
    const prefill: Record<string, number> = {};
    recommendations.forEach((rec) => {
      if (rec.urgency !== 'Normal' && rec.recommendedOrderQty > 0) {
        prefill[rec.itemId] = rec.recommendedOrderQty;
      }
    });
    setSelectedItemsToOrder(prefill);
  };

  const handleQtyChange = (itemId: string, qty: number) => {
    setSelectedItemsToOrder((prev) => ({
      ...prev,
      [itemId]: Math.max(0, qty),
    }));
  };

  const activeSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  // Calcular subtotal de la orden que se está creando
  const orderItemsList = Object.entries(selectedItemsToOrder)
    .filter(([_, qty]) => qty > 0)
    .map(([itemId, qty]) => {
      const item = inventory.find((i) => i.id === itemId)!;
      return {
        itemId,
        name: item.name,
        quantity: qty,
        unitCostCOP: item.unitCostCOP,
        subtotalCOP: qty * item.unitCostCOP,
      };
    });

  const totalPOCostCOP = orderItemsList.reduce((acc, i) => acc + i.subtotalCOP, 0);

  const handleCreatePO = () => {
    if (orderItemsList.length === 0) return;

    const poCode = `OC-2026-${String(existingPOs.length + 1).padStart(3, '0')}`;
    const expectedDelivery = new Date(Date.now() + activeSupplier.leadTimeDays * 86400000)
      .toISOString()
      .split('T')[0];

    onGeneratePurchaseOrder({
      code: poCode,
      supplierId: activeSupplier.id,
      supplierName: activeSupplier.name,
      items: orderItemsList,
      totalCOP: totalPOCostCOP,
      status: 'Enviada',
      expectedDelivery,
      notes: orderNotes,
    });

    setSelectedItemsToOrder({});
  };

  return (
    <div className="space-y-6">
      {/* Header Sunil Chopra */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              <span>Módulo 3</span>
              <span>·</span>
              <span>Fundamento Teórico: Sunil Chopra (Supply Chain Management)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Planificación de Abastecimiento & Compras (Modelo EOQ & ROP)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Según <strong>Sunil Chopra</strong>, la eficiencia de la cadena de suministro se logra calculando el <strong>Punto de Reorden (ROP = d × L + SS)</strong> y el <strong>Tamaño Óptimo de Lote (EOQ)</strong> para minimizar conjuntamente los costos de emisión de órdenes y mantenimiento de inventario, sincronizado con los tiempos de entrega (Lead Time) de los proveedores del Valle del Cauca.
            </p>
          </div>

          <button
            onClick={handleAutoFillRecommended}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cargar Cantidades Sugeridas por Chopra</span>
          </button>
        </div>
      </div>

      {/* Tabla del Asistente de Abastecimiento (Cálculos Chopra) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-700" />
              <span>Matriz Analítica de Reabastecimiento de Láminas de Vidrio</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cálculo automatizado basado en consumo diario, stock de seguridad y tiempo de tránsito de proveedores.
            </p>
          </div>
          <span className="text-xs text-indigo-900 font-semibold bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
            Fórmula: ROP = (Demanda d × Lead Time L) + SS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Lámina de Vidrio</th>
                <th className="py-3 px-4 text-right">Stock Actual</th>
                <th className="py-3 px-4 text-right">Demanda Diaria (d)</th>
                <th className="py-3 px-4">Proveedor Sugerido</th>
                <th className="py-3 px-4 text-center">Lead Time (L)</th>
                <th className="py-3 px-4 text-right">Punto Reorden (ROP)</th>
                <th className="py-3 px-4 text-right">Lote Óptimo (EOQ)</th>
                <th className="py-3 px-4 text-center">Urgencia Chopra</th>
                <th className="py-3 px-4 text-center">Cantidad a Pedir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {recommendations.map((rec) => {
                const currentQty = selectedItemsToOrder[rec.itemId] || 0;
                return (
                  <tr key={rec.itemId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs">
                      {rec.itemName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {rec.currentStock} hojas
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {rec.avgDailyDemand} hojas/día
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-medium text-slate-900">{rec.suggestedSupplier.name.split('(')[0]}</div>
                      <div className="text-[11px] text-slate-400">{rec.suggestedSupplier.location.split('(')[0]}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                      {rec.leadTimeDays} días
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-800">
                      {rec.reorderPoint} hojas
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {rec.economicOrderQuantity} hojas
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {rec.urgency === 'Crítica' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200">
                          Crítica (Pedir Ya)
                        </span>
                      ) : rec.urgency === 'Media' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200">
                          Reorden Activo
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 bg-slate-100">
                          Stock Seguro
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={currentQty === 0 ? '' : currentQty}
                          placeholder={String(rec.recommendedOrderQty || 0)}
                          onChange={(e) => handleQtyChange(rec.itemId, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-xs text-center border border-slate-300 rounded font-mono font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                        />
                        <button
                          onClick={() => handleQtyChange(rec.itemId, rec.recommendedOrderQty || rec.economicOrderQuantity)}
                          className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded border border-slate-200 transition-colors"
                          title="Fijar cantidad sugerida"
                        >
                          Sugerir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Generador de Orden de Compra (Izquierda) + Directorio de Proveedores (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Generador de Orden de Compra */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-700" />
                <span>Generar Orden de Compra Formal</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolida los requerimientos y emite el pedido al proveedor seleccionado.
              </p>
            </div>
            {orderItemsList.length > 0 && (
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                {orderItemsList.length} ítems seleccionados
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proveedor Seleccionado:
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
              >
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.leadTimeDays} días Lead Time)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiempo Estimado de Entrega en Bodega:
              </label>
              <div className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                {activeSupplier.leadTimeDays} días calendario ({activeSupplier.location})
              </div>
            </div>
          </div>

          {/* Resumen de Ítems en la Orden */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200 flex justify-between">
              <span>Láminas a Pedir</span>
              <span>Subtotal COP</span>
            </div>
            {orderItemsList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Ingresa cantidades en la tabla superior o presiona "Cargar Cantidades Sugeridas por Chopra".
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {orderItemsList.map((item) => (
                  <div key={item.itemId} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.quantity} hojas × {formatCOP(item.unitCostCOP)}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatCOP(item.subtotalCOP)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {orderItemsList.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <span className="text-xs font-bold text-indigo-950">
                Inversión Total Estimada:
              </span>
              <span className="font-mono font-bold text-base text-indigo-900 tabular-nums">
                {formatCOP(totalPOCostCOP)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas e Instrucciones de Entrega:
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <button
            onClick={handleCreatePO}
            disabled={orderItemsList.length === 0}
            className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Emitir Orden de Compra y Notificar Proveedor</span>
          </button>
        </div>

        {/* Proveedores del Valle del Cauca & Órdenes Pendientes */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tarjetas de Proveedores */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-slate-700" />
              <span>Directorio de Proveedores Regionales</span>
            </h3>

            <div className="space-y-3">
              {suppliers.map((sup) => (
                <div
                  key={sup.id}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    selectedSupplierId === sup.id
                      ? 'bg-indigo-50/60 border-indigo-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{sup.name}</span>
                    <span className="font-mono text-[11px] font-semibold text-indigo-700">
                      L = {sup.leadTimeDays} días
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {sup.location} · {sup.phone}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-600">
                      Confiabilidad: <strong>{sup.reliabilityScore}%</strong>
                    </span>
                    <span className="text-slate-600">
                      Pedido Mínimo: <strong>{formatCOP(sup.minOrderCOP)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Órdenes de Compra Emitidas & Simulación de Llegada de Camión */}
          {existingPOs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-indigo-700" />
                <span>Órdenes de Compra en Tránsito</span>
              </h3>

              <div className="space-y-2.5">
                {existingPOs.map((po) => (
                  <div
                    key={po.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{po.code}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          po.status === 'Recibida en Bodega'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>
                    <div className="text-slate-700 font-medium">{po.supplierName}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Llegada estimada: {po.expectedDelivery}</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatCOP(po.totalCOP)}
                      </span>
                    </div>

                    {po.status !== 'Recibida en Bodega' && (
                      <button
                        onClick={() => onReceivePurchaseOrder(po.id, po.items)}
                        className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Simular Descarga & Recepción en Bodega</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
