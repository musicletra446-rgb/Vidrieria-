import React, { useState } from 'react';
import { DispatchOrder, OrderStatus } from '../types/logistics';
import { formatCOP } from '../utils/logisticsCalculations';
import {
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  ChevronRight,
  Shield,
  ArrowRight,
  Printer,
  Navigation,
} from 'lucide-react';

interface DistributionModuleProps {
  orders: DispatchOrder[];
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onOpenNewOrderModal: () => void;
  onViewDispatchSlip: (order: DispatchOrder) => void;
}

export const DistributionModule: React.FC<DistributionModuleProps> = ({
  orders,
  onAdvanceOrderStatus,
  onOpenNewOrderModal,
  onViewDispatchSlip,
}) => {
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('Todos');

  const neighborhoods = [
    'Todos',
    'Barrio Santa Bárbara',
    'Barrio El Molino',
    'Barrio Centro',
    'Barrio San Vicente',
    'Chambimbal',
  ];

  const columns: { status: OrderStatus; label: string; color: string; countBadge: string }[] = [
    { status: 'Recibido', label: '1. Recibido / Cotizado', color: 'border-slate-300 bg-slate-50', countBadge: 'bg-slate-200 text-slate-700' },
    { status: 'En Producción', label: '2. En Taller / Corte', color: 'border-amber-300 bg-amber-50/40', countBadge: 'bg-amber-100 text-amber-800' },
    { status: 'Listo para Despacho', label: '3. Listo para Despacho', color: 'border-cyan-300 bg-cyan-50/40', countBadge: 'bg-cyan-100 text-cyan-800' },
    { status: 'Entregado', label: '4. Entregado a Cliente', color: 'border-emerald-300 bg-emerald-50/40', countBadge: 'bg-emerald-100 text-emerald-800' },
  ];

  const filteredOrders = orders.filter((o) => {
    return filterNeighborhood === 'Todos' || o.neighborhood === filterNeighborhood;
  });

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'Recibido':
        return 'En Producción';
      case 'En Producción':
        return 'Listo para Despacho';
      case 'Listo para Despacho':
        return 'Entregado';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Ronald H. Ballou Distribución */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wide">
              <span>Módulo 4</span>
              <span>·</span>
              <span>Fundamento Teórico: Ronald H. Ballou (Physical Distribution & Customer Service)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Gestión de Distribución Física & Logística de Despachos en Buga
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Según <strong>Ronald H. Ballou</strong>, la distribución física coordina el flujo de salida de productos hacia el cliente final asegurando el nivel de servicio prometido. En el caso del vidrio, exige protocolos de embalaje amortiguado, asignación de vehículos con caballetes laterales y coordinación de entregas por WhatsApp y telefonía.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewOrderModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Pedido WhatsApp / Teléfono</span>
            </button>
          </div>
        </div>

        {/* Filtros por Barrio de Buga & Estadísticas */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Filtrar por sector de Buga:</span>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {neighborhoods.map((n) => (
                <button
                  key={n}
                  onClick={() => setFilterNeighborhood(n)}
                  className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors whitespace-nowrap ${
                    filterNeighborhood === n
                      ? 'bg-teal-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total en seguimiento:{' '}
            <span className="font-mono font-bold text-slate-900">{filteredOrders.length}</span> pedidos
          </div>
        </div>
      </div>

      {/* Tablero Kanban de Distribución y Despachos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const columnOrders = filteredOrders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col"
            >
              {/* Encabezado de Columna */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900">{col.label}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${col.countBadge}`}>
                  {columnOrders.length}
                </span>
              </div>

              {/* Lista de Pedidos en este Estado */}
              <div className="space-y-3 flex-1">
                {columnOrders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No hay pedidos en esta etapa
                  </div>
                ) : (
                  columnOrders.map((order) => {
                    const next = getNextStatus(order.status);

                    return (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all shadow-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {order.orderNumber}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {order.channel === 'WhatsApp' ? (
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Phone className="w-3 h-3 text-blue-600" />
                            )}
                            {order.channel}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {order.customerName}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">{order.deliveryAddress}</span>
                          </div>
                          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
                            {order.neighborhood}
                          </div>
                        </div>

                        {/* Ítems del Pedido */}
                        <div className="p-2 bg-white rounded border border-slate-100 text-[11px] space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-700">
                              <span className="truncate">
                                {it.quantity}x {it.description}
                              </span>
                              {it.dimensions && (
                                <span className="text-slate-400 text-[10px] shrink-0 ml-1">
                                  {it.dimensions}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Transporte y Fragilidad */}
                        <div className="text-[10px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                          <div>
                            <strong>Vehículo:</strong> {order.deliveryType}
                          </div>
                          <div className="text-slate-500">
                            <strong>Protocolo:</strong> {order.fragilityProtocol}
                          </div>
                          <div className="text-slate-500">
                            <strong>Hora estimada:</strong> {order.estimatedDeliveryTime}
                          </div>
                        </div>

                        {/* Valor y Acciones */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1">
                          <span className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                            {formatCOP(order.totalCOP)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onViewDispatchSlip(order)}
                              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                              title="Ver Guía de Despacho (Remisión)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {next && (
                              <button
                                onClick={() => onAdvanceOrderStatus(order.id, next)}
                                className="px-2 py-1 text-[11px] font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <span>Avanzar</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Protocolos de Despacho de Vidrio y Ruteo Local en Buga */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-teal-700" />
            <span>Protocolo de Transporte de Material Frágil (Ballou)</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Las láminas y productos en vidrio sufren mayores averías durante el trayecto de última milla. Para los despachos en Buga:
          </p>
          <ul className="text-xs text-slate-600 mt-2 space-y-1 list-disc list-inside">
            <li>Camioneta acondicionada con <strong>caballete piramidal exterior</strong> y forro en fieltro de goma.</li>
            <li>Uso obligatorio de <strong>esquineros de espuma de polietileno expandido</strong> en las cuatro esquinas de espejos y ventanas.</li>
            <li>Ajuste con <strong>riatas de trinquete de 2 pulgadas</strong> con protector para evitar que el metal golpee el canto del vidrio.</li>
            <li>En vías destapadas hacia Chambimbal o zonas rurales, velocidad restringida a <strong>20 km/h</strong>.</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-teal-700" />
            <span>Zonas de Cobertura de Entrega Directa en Buga</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Rutas programadas desde la sede central de Vidriería La Primera:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold text-slate-900">Ruta 1 (Centro & Basílica):</span>
              <p className="text-slate-500 text-[11px] mt-0.5">Barrio Centro, Santa Bárbara, San Vicente. Salidas cada 2 horas.</p>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold text-slate-900">Ruta 2 (Norte & Residencial):</span>
              <p className="text-slate-500 text-[11px] mt-0.5">El Molino, Paloblanco, Divino Niño. Despacho en la tarde.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
