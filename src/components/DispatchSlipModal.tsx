import React from 'react';
import { DispatchOrder } from '../types/logistics';
import { formatCOP } from '../utils/logisticsCalculations';
import { X, Printer, Shield, CheckCircle2, Layers } from 'lucide-react';

interface DispatchSlipModalProps {
  order: DispatchOrder | null;
  onClose: () => void;
}

export const DispatchSlipModal: React.FC<DispatchSlipModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">
              Guía de Despacho / Remisión Oficial
            </span>
            <span className="font-mono text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Remisión</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Remisión Imprimible Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800 print:p-0">
          
          {/* Encabezado Corporativo */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-cyan-700 text-white rounded flex items-center justify-center font-bold text-sm">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-black text-lg text-slate-900 tracking-tight">
                  VIDRIERÍA LA PRIMERA
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                NIT 900.384.921-4 · Guadalajara de Buga, Valle del Cauca
              </p>
              <p className="text-[11px] text-slate-500">
                Sede Central: Carrera 14 # 9-40 · Tel: +57 (602) 238-1920 / WhatsApp: 318 630 1144
              </p>
            </div>

            <div className="text-right">
              <div className="font-mono font-bold text-base text-slate-900">
                REMISION #{order.orderNumber}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">Fecha: {order.date}</div>
              <div className="text-teal-800 font-semibold text-[11px]">
                Estado: {order.status}
              </div>
            </div>
          </div>

          {/* Información del Cliente y Destino */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Destinatario:
              </span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{order.customerName}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">Tel: {order.customerPhone}</div>
              <div className="text-slate-500 text-[11px]">Canal: {order.channel}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Dirección en Buga:
              </span>
              <div className="font-bold text-slate-900 mt-0.5">{order.deliveryAddress}</div>
              <div className="text-teal-800 font-semibold text-[11px] mt-0.5">
                Sector: {order.neighborhood}
              </div>
              <div className="text-slate-500 text-[11px]">Hora estimada: {order.estimatedDeliveryTime}</div>
            </div>
          </div>

          {/* Detalles de Transporte y Fragilidad */}
          <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200 text-[11px] text-teal-950 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Protocolo de Fragilidad (Ballou): </span>
              <span>{order.fragilityProtocol} · </span>
              <span><strong>Vehículo:</strong> {order.deliveryType} · </span>
              <span><strong>Conductor / Despachador:</strong> {order.driverName || 'Asignado en Patio'}</span>
              <p className="text-teal-900 text-[10px] mt-1">
                {order.notes}
              </p>
            </div>
          </div>

          {/* Tabla de Artículos Entregados */}
          <table className="w-full text-left text-xs border border-slate-200 rounded overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Cant.</th>
                <th className="py-2 px-3">Descripción del Producto / Lámina</th>
                <th className="py-2 px-3 text-center">Dimensiones</th>
                <th className="py-2 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{it.quantity}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{it.description}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                    {it.dimensions || 'Estándar'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCOP(order.totalCOP)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Advertencia Legal & Cláusula de Vidrio */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 leading-relaxed">
            <strong>Condiciones de Entrega de Vidrio Plano:</strong> El cliente debe verificar la ausencia de desportillados, fisuras o rayones en presencia del transportador antes de firmar la remisión. Vidriería La Primera no se responsabiliza por rupturas ocasionadas durante instalaciones de terceros posteriores a la firma de recibido a satisfacción.
          </div>

          {/* Firmas de Entrega y Recibido */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-1.5">
              <span className="font-bold text-slate-800">Entregado por:</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Vidriería La Primera - Despachos</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <span className="font-bold text-slate-800">Recibido a Satisfacción:</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Firma Cliente / C.C.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
