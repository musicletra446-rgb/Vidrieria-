import React from 'react';
import { StorageRack, InventoryItem, DispatchOrder, ModuleTab, BlockageIssue } from '../types/logistics';
import { formatCOP } from '../utils/logisticsCalculations';
import {
  Warehouse,
  Boxes,
  ShoppingCart,
  Truck,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  Scale,
  Zap,
} from 'lucide-react';

interface DashboardOverviewProps {
  racks: StorageRack[];
  inventory: InventoryItem[];
  orders: DispatchOrder[];
  blockages: BlockageIssue[];
  onNavigate: (tab: ModuleTab) => void;
  onSimulateTruckArrival: () => void;
  onSimulateNewOrder: () => void;
  onSimulateGlassBreakage: () => void;
  onResolveBlockage: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  racks,
  inventory,
  orders,
  blockages,
  onNavigate,
  onSimulateTruckArrival,
  onSimulateNewOrder,
  onSimulateGlassBreakage,
  onResolveBlockage,
}) => {
  // Cálculos consolidados
  const totalSheetsInStorage = racks.reduce(
    (acc, r) => acc + r.sheets.reduce((sAcc, s) => sAcc + s.quantity, 0),
    0
  );

  const totalWeightKg = racks.reduce((acc, r) => acc + r.currentWeightKg, 0);

  const totalInventoryValueCOP = inventory.reduce(
    (acc, item) => acc + item.stock * item.unitCostCOP,
    0
  );

  const lowStockItems = inventory.filter((item) => item.stock <= item.minStock);

  const pendingDispatches = orders.filter((o) => o.status !== 'Entregado');

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Corporate Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-700">
              <span>Vidriería La Primera</span>
              <span>·</span>
              <span>Guadalajara de Buga, Valle del Cauca</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Centro de Control Logístico y Operaciones
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Plataforma integral diseñada para optimizar el almacenamiento de láminas pesadas, el control de inventario en tiempo real, el cálculo de reabastecimiento con proveedores regionales y la distribución local de pedidos.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
            <Scale className="w-4 h-4 text-slate-700 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Carga Total en Caballetes:</span>{' '}
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {(totalWeightKg / 1000).toFixed(2)} Toneladas
              </span>{' '}
              <span className="text-slate-500">({totalSheetsInStorage} láminas)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tompkins KPI */}
        <div
          onClick={() => onNavigate('almacenamiento')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">James A. Tompkins</span>
            <div className={`p-2 rounded-lg ${blockages.length > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {blockages.length > 0 ? `${blockages.length} Bloqueos` : '0 Bloqueos'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {blockages.length > 0
                ? 'Lámina pesada/baja rotación obstruye material de alta rotación'
                : 'Caballetes alineados por frecuencia ABC y peso'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-cyan-700 group-hover:text-cyan-800">
            <span>Ver mapa de bodega</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Ballou Inventory KPI */}
        <div
          onClick={() => onNavigate('inventarios')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ronald H. Ballou</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 truncate">
              {formatCOP(totalInventoryValueCOP)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Valorización total ({inventory.length} referencias activas)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-700 group-hover:text-blue-800">
            <span>Gestionar kardex</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Chopra Replenishment KPI */}
        <div
          onClick={() => onNavigate('abastecimiento')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sunil Chopra</span>
            <div className={`p-2 rounded-lg ${lowStockItems.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'}`}>
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {lowStockItems.length} en Reorden
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Referencias con stock ≤ punto de reorden (ROP)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-indigo-700 group-hover:text-indigo-800">
            <span>Planificar compras EOQ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Ballou Distribution KPI */}
        <div
          onClick={() => onNavigate('distribucion')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ronald H. Ballou</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {pendingDispatches.length} Pedidos
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Despachos coordinados por WhatsApp / Teléfono
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-teal-700 group-hover:text-teal-800">
            <span>Ver ruta en Buga</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Alerta de bloqueo Tompkins si existe */}
      {blockages.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-950 text-sm">
                  Alerta Teórica de Almacenamiento (James A. Tompkins):
                </span>
                <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-medium">
                  Interferencia en Caballete {blockages[0].rackCode}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                {blockages[0].reason}
              </p>
            </div>
          </div>
          <button
            onClick={onResolveBlockage}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap self-stretch md:self-auto text-center"
          >
            Reordenar según Principio Tompkins
          </button>
        </div>
      )}

      {/* Fundamentos Teóricos de los 4 Autores de la Logística */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-slate-700" />
          <h2 className="text-base font-bold text-slate-900">
            Marco Teórico de la Gestión Logística en Vidriería La Primera
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Tompkins Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">1. James A. Tompkins</div>
              <div className="text-slate-500 font-medium mt-0.5">Gestión de Almacenamiento & Layout</div>
              <p className="text-slate-600 mt-2 leading-relaxed">
                Postula la optimización de espacios y la eliminación de la <em>doble manipulación</em>. En el vidrio, las láminas pesadas o de baja rotación jamás deben bloquear a las láminas de alta rotación (3mm, 4mm, espejos).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-slate-700 font-medium">
              Aplicación: Matriz de Caballetes A-Frame con clasificación ABC y pesos.
            </div>
          </div>

          {/* Ballou Inventarios Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">2. Ronald H. Ballou</div>
              <div className="text-slate-500 font-medium mt-0.5">Gestión de Inventarios</div>
              <p className="text-slate-600 mt-2 leading-relaxed">
                Establece el equilibrio entre costos de mantenimiento y disponibilidad de servicio mediante el control riguroso de entradas, salidas y mermas por rotura en taller.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-slate-700 font-medium">
              Aplicación: Kardex en tiempo real de láminas y productos terminados.
            </div>
          </div>

          {/* Chopra Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">3. Sunil Chopra</div>
              <div className="text-slate-500 font-medium mt-0.5">Gestión de Abastecimiento</div>
              <p className="text-slate-600 mt-2 leading-relaxed">
                Enfoca la coordinación de la cadena de suministro, integrando la demanda pronosticada, tiempos de entrega de proveedores (Lead Time) y la cantidad económica de pedido (EOQ).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-slate-700 font-medium">
              Aplicación: Asistente de compras y convenios con Vidrios Andinos y distribuidores del Valle.
            </div>
          </div>

          {/* Ballou Distribución Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">4. Ronald H. Ballou</div>
              <div className="text-slate-500 font-medium mt-0.5">Gestión de Distribución Física</div>
              <p className="text-slate-600 mt-2 leading-relaxed">
                Modela el servicio al cliente y la logística de última milla. Requiere protocolos estrictos para el transporte vertical de material frágil y ruteo en Buga.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-slate-700 font-medium">
              Aplicación: Pipeline de pedidos, guías de despacho y asignación vehicular.
            </div>
          </div>
        </div>
      </div>

      {/* Simulador Interactivo de Eventos Operativos */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Simulador de Operaciones en Vivo</h3>
              <p className="text-xs text-slate-400">
                Prueba en tiempo real cómo interactúan los cuatro módulos teóricos ante eventos cotidianos de la vidriería.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={onSimulateNewOrder}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors group"
          >
            <div className="text-xs font-semibold text-cyan-400 flex items-center justify-between">
              <span>1. Venta por WhatsApp</span>
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1">
              Cliente solicita ventana 744 y espejo
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Descuenta inventario y crea pedido para Santa Bárbara.
            </p>
          </button>

          <button
            onClick={onSimulateTruckArrival}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors group"
          >
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
              <span>2. Llegada de Camión</span>
              <Boxes className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1">
              Llegan 15 láminas desde Yumbo
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Nutre stock y almacena en Caballete A1 automáticamente.
            </p>
          </button>

          <button
            onClick={onSimulateGlassBreakage}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors group"
          >
            <div className="text-xs font-semibold text-rose-400 flex items-center justify-between">
              <span>3. Merma Accidental</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1">
              Rotura de lámina 5mm en corte
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Registra merma en kardex y activa alerta de stock crítico.
            </p>
          </button>

          <button
            onClick={onResolveBlockage}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors group"
          >
            <div className="text-xs font-semibold text-amber-400 flex items-center justify-between">
              <span>4. Optimización Tompkins</span>
              <Warehouse className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1">
              Reorganizar Caballete C1
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Mueve vidrio de 10mm al fondo y libera material de rotación A.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
