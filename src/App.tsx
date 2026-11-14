/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ModuleTab, StorageRack, InventoryItem, InventoryMovement, Supplier, DispatchOrder, PurchaseOrder, OrderStatus, MovementType } from './types/logistics';
import { INITIAL_RACKS, INITIAL_INVENTORY, INITIAL_MOVEMENTS, INITIAL_SUPPLIERS, INITIAL_DISPATCH_ORDERS } from './data/initialData';
import { detectTompkinsBlockages, optimizeRackLayout } from './utils/logisticsCalculations';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { StorageModule } from './components/StorageModule';
import { InventoryModule } from './components/InventoryModule';
import { ReplenishmentModule } from './components/ReplenishmentModule';
import { DistributionModule } from './components/DistributionModule';
import { NewMovementModal } from './components/NewMovementModal';
import { NewOrderModal } from './components/NewOrderModal';
import { DispatchSlipModal } from './components/DispatchSlipModal';
import { CheckCircle2, AlertTriangle, Info, Bell, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('resumen');

  // Estados de datos principales
  const [racks, setRacks] = useState<StorageRack[]>(INITIAL_RACKS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_MOVEMENTS);
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [orders, setOrders] = useState<DispatchOrder[]>(INITIAL_DISPATCH_ORDERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po-1',
      code: 'OC-2026-001',
      date: '2026-11-09',
      supplierId: 'sup-1',
      supplierName: 'Vidrios Andinos S.A. (Planta Yumbo)',
      items: [
        { itemId: 'inv-1', name: 'Lámina Vidrio Claro 4mm (2.44 x 1.83m)', quantity: 20, unitCostCOP: 135000, subtotalCOP: 2700000 },
        { itemId: 'inv-2', name: 'Lámina Vidrio Claro 5mm (2.60 x 1.80m)', quantity: 15, unitCostCOP: 178000, subtotalCOP: 2670000 },
      ],
      totalCOP: 5370000,
      status: 'Enviada',
      expectedDelivery: '2026-11-13',
      notes: 'Despacho prioritario en camión con caballetes laterales.',
    },
  ]);

  // Modales
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [preselectedInventoryItem, setPreselectedInventoryItem] = useState<InventoryItem | undefined>();
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [viewingSlipOrder, setViewingSlipOrder] = useState<DispatchOrder | null>(null);

  // Notificación tipo Toast para retroalimentación
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (title: string, text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToastMessage({ title, text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.title === title ? null : prev));
    }, 4500);
  };

  // Bloqueos Tompkins detectados en tiempo real
  const blockages = detectTompkinsBlockages(racks);

  // 1. James A. Tompkins: Reordenar caballete para eliminar doble manipulación y bloqueos
  const handleOptimizeRack = (rackId: string) => {
    setRacks((prev) =>
      prev.map((r) => {
        if (r.id === rackId) {
          return optimizeRackLayout(r);
        }
        return r;
      })
    );
    showToast(
      'Optimización Tompkins Aplicada',
      `Caballete reorganizado. Las láminas de alta rotación (Clase A) quedaron en el frente accesible y calibres pesados al fondo.`,
      'success'
    );
  };

  const handleResolveAllBlockages = () => {
    setRacks((prev) => prev.map((r) => optimizeRackLayout(r)));
    showToast(
      'Bodega Optimizada (Tompkins)',
      'Todos los caballetes han sido reorganizados por frecuencia ABC y peso. 0 interferencias activas.',
      'success'
    );
  };

  const handleMoveSheetSlot = (rackId: string, sheetId: string, direction: 'up' | 'down') => {
    setRacks((prev) =>
      prev.map((rack) => {
        if (rack.id !== rackId) return rack;

        const sheets = [...rack.sheets].sort((a, b) => a.slotPosition - b.slotPosition);
        const idx = sheets.findIndex((s) => s.id === sheetId);
        if (idx === -1) return rack;

        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= sheets.length) return rack;

        // Intercambiar posiciones
        const temp = sheets[idx].slotPosition;
        sheets[idx].slotPosition = sheets[targetIdx].slotPosition;
        sheets[targetIdx].slotPosition = temp;

        return {
          ...rack,
          sheets: [...sheets].sort((a, b) => a.slotPosition - b.slotPosition),
        };
      })
    );
  };

  // 2. Ronald H. Ballou: Control de inventario en tiempo real
  const handleQuickAdjust = (itemId: string, delta: number, type: MovementType) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    if (item.stock + delta < 0) return;

    const newStock = item.stock + delta;
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: newStock, lastUpdated: 'Hace un momento' } : i))
    );

    // Registrar en kardex
    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      itemId,
      itemName: item.name,
      type,
      quantity: Math.abs(delta),
      reason: type === 'Entrada' ? 'Ajuste Físico' : type === 'Merma' ? 'Rotura/Avería en Taller' : 'Venta Directa',
      referenceDoc: `AJUSTE-${Math.floor(100 + Math.random() * 900)}`,
      responsible: 'Operador de Patio Buga',
    };

    setMovements((prev) => [newMovement, ...prev]);

    showToast(
      `${type} registrada en Kardex`,
      `${item.name}: ${delta > 0 ? `+${delta}` : delta} ${item.unit}. Stock actual: ${newStock}.`,
      type === 'Merma' ? 'alert' : 'info'
    );
  };

  const handleMovementSubmit = (data: {
    itemId: string;
    type: MovementType;
    quantity: number;
    reason: any;
    referenceDoc: string;
    responsible: string;
  }) => {
    const item = inventory.find((i) => i.id === data.itemId);
    if (!item) return;

    const delta = data.type === 'Entrada' ? data.quantity : -data.quantity;
    const newStock = Math.max(0, item.stock + delta);

    setInventory((prev) =>
      prev.map((i) => (i.id === data.itemId ? { ...i, stock: newStock, lastUpdated: 'Recién registrado' } : i))
    );

    const newMov: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      itemId: data.itemId,
      itemName: item.name,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      referenceDoc: data.referenceDoc,
      responsible: data.responsible,
    };

    setMovements((prev) => [newMov, ...prev]);

    showToast(
      'Movimiento Kardex Guardado',
      `${data.type} de ${data.quantity} ${item.unit} registrada con documento ${data.referenceDoc}.`,
      'success'
    );
  };

  // 3. Sunil Chopra: Generar y Recibir Orden de Compra
  const handleGeneratePurchaseOrder = (newPOData: Omit<PurchaseOrder, 'id' | 'date'>) => {
    const newPO: PurchaseOrder = {
      ...newPOData,
      id: `po-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    showToast(
      'Orden de Compra Emitida',
      `Se envió la orden ${newPO.code} a ${newPO.supplierName}. Fecha estimada de entrega: ${newPO.expectedDelivery}.`,
      'success'
    );
  };

  const handleReceivePurchaseOrder = (poId: string, items: { itemId: string; quantity: number }[]) => {
    // 1. Marcar PO como recibida
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'Recibida en Bodega' } : p))
    );

    // 2. Incrementar stock en inventario
    setInventory((prev) =>
      prev.map((item) => {
        const ordered = items.find((it) => it.itemId === item.id);
        if (ordered) {
          return {
            ...item,
            stock: item.stock + ordered.quantity,
            lastUpdated: 'Recibido de camión',
          };
        }
        return item;
      })
    );

    // 3. Registrar entradas en kardex
    const newMovs: InventoryMovement[] = items.map((it) => {
      const invItem = inventory.find((i) => i.id === it.itemId)!;
      return {
        id: `mov-${Date.now()}-${it.itemId}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        itemId: it.itemId,
        itemName: invItem ? invItem.name : 'Lámina de Vidrio',
        type: 'Entrada',
        quantity: it.quantity,
        reason: 'Compra Proveedor',
        referenceDoc: `RECEP-${poId}`,
        responsible: 'Jefe de Bodega Buga',
      };
    });

    setMovements((prev) => [...newMovs, ...prev]);

    showToast(
      'Mercancía Descargada e Ingresada a Bodega',
      `Se recibieron y almacenaron ${items.reduce((acc, i) => acc + i.quantity, 0)} láminas de vidrio en los caballetes correspondientes.`,
      'success'
    );
  };

  // 4. Ronald H. Ballou: Distribución de pedidos en Buga
  const handleAdvanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    showToast(
      'Estado de Pedido Actualizado',
      `El pedido avanzó a la fase "${nextStatus}". Notificación enviada al cliente por WhatsApp.`,
      'info'
    );
  };

  const handleNewOrderSubmit = (newOrderData: Omit<DispatchOrder, 'id'>) => {
    const newOrder: DispatchOrder = {
      ...newOrderData,
      id: `disp-${Date.now()}`,
    };

    setOrders((prev) => [newOrder, ...prev]);

    showToast(
      'Nuevo Pedido Registrado en Buga',
      `Pedido ${newOrder.orderNumber} para ${newOrder.customerName} (${newOrder.neighborhood}) ingresado a programación.`,
      'success'
    );
  };

  // Simulaciones Operativas Integradas
  const handleSimulateNewOrder = () => {
    const randomNeighborhoods = ['Barrio Santa Bárbara', 'Barrio Centro', 'Barrio El Molino', 'Chambimbal'];
    const chosenNb = randomNeighborhoods[Math.floor(Math.random() * randomNeighborhoods.length)];
    const simOrder: DispatchOrder = {
      id: `disp-sim-${Date.now()}`,
      orderNumber: `PED-BUG-${Math.floor(200 + Math.random() * 700)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: 'Dra. Patricia Cardona (Clínica Buga)',
      customerPhone: '+57 314 555 8920',
      channel: 'WhatsApp',
      deliveryAddress: 'Carrera 15 # 4-82 Consultorio 201',
      neighborhood: chosenNb,
      items: [
        { description: 'Espejo Flotante Biselado con Luz LED', quantity: 1, dimensions: '1.00 x 0.70m' },
        { description: 'Repisa de Vidrio 6mm templado', quantity: 2, dimensions: '0.60 x 0.20m' },
      ],
      totalCOP: 490000,
      status: 'Recibido',
      deliveryType: 'Domicilio Motocarguero',
      driverName: 'Darío Vélez',
      fragilityProtocol: 'Embalaje con Plástico Burbuja',
      estimatedDeliveryTime: 'Hoy 05:00 PM',
      notes: 'Llamar antes de timbrar. Piso 2 por escaleras amplias.',
    };

    setOrders((prev) => [simOrder, ...prev]);
    showToast(
      'Simulación: Mensaje de WhatsApp Recibido',
      `Cliente solicitó espejo LED y repisas para despacho en ${chosenNb}. Pedido ${simOrder.orderNumber} creado.`,
      'info'
    );
  };

  const handleSimulateTruckArrival = () => {
    const qtyAdded = 15;
    const sheetItem = inventory.find((i) => i.id === 'inv-1')!;

    setInventory((prev) =>
      prev.map((it) => (it.id === 'inv-1' ? { ...it, stock: it.stock + qtyAdded, lastUpdated: 'Camión Yumbo' } : it))
    );

    // Agregar al caballete A1
    setRacks((prev) =>
      prev.map((rack) => {
        if (rack.id === 'rack-a1') {
          return {
            ...rack,
            currentWeightKg: rack.currentWeightKg + Math.round(qtyAdded * 44.6),
            sheets: rack.sheets.map((s) => (s.id === 'sheet-1' ? { ...s, quantity: s.quantity + qtyAdded } : s)),
          };
        }
        return rack;
      })
    );

    const mov: InventoryMovement = {
      id: `mov-sim-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      itemId: 'inv-1',
      itemName: sheetItem.name,
      type: 'Entrada',
      quantity: qtyAdded,
      reason: 'Compra Proveedor',
      referenceDoc: 'REM-ANDINOS-8902',
      responsible: 'Recepción Portón Descarga',
    };

    setMovements((prev) => [mov, ...prev]);

    showToast(
      'Simulación: Camión de Vidrios Andinos Descargado',
      `Ingresaron +${qtyAdded} láminas de Vidrio Claro 4mm al Caballete A1 (Frente a mesa de corte).`,
      'success'
    );
  };

  const handleSimulateGlassBreakage = () => {
    const item = inventory.find((i) => i.id === 'inv-2')!;
    if (item.stock <= 0) return;

    setInventory((prev) =>
      prev.map((it) => (it.id === 'inv-2' ? { ...it, stock: Math.max(0, it.stock - 1), lastUpdated: 'Reporte Merma' } : it))
    );

    const mov: InventoryMovement = {
      id: `mov-break-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      itemId: 'inv-2',
      itemName: item.name,
      type: 'Merma',
      quantity: 1,
      reason: 'Rotura/Avería en Taller',
      referenceDoc: 'ACTA-MERMA-09',
      responsible: 'Maestro Cortador Carlos Buga',
    };

    setMovements((prev) => [mov, ...prev]);

    showToast(
      'Simulación: Rotura Accidental en Corte',
      `Se registró merma de 1 lámina de Vidrio 5mm por estrés térmico al cantear. Stock en punto crítico (Ballou).`,
      'alert'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Barra Superior con Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onRunSimulation={handleSimulateNewOrder}
        hasBlockage={blockages.length > 0}
      />

      {/* Notificación Flotante Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 p-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toastMessage.type === 'alert' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toastMessage.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-xs font-bold text-white">{toastMessage.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.text}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'resumen' && (
          <DashboardOverview
            racks={racks}
            inventory={inventory}
            orders={orders}
            blockages={blockages}
            onNavigate={(tab) => setActiveTab(tab)}
            onSimulateTruckArrival={handleSimulateTruckArrival}
            onSimulateNewOrder={handleSimulateNewOrder}
            onSimulateGlassBreakage={handleSimulateGlassBreakage}
            onResolveBlockage={handleResolveAllBlockages}
          />
        )}

        {activeTab === 'almacenamiento' && (
          <StorageModule
            racks={racks}
            blockages={blockages}
            onOptimizeRack={handleOptimizeRack}
            onMoveSheetSlot={handleMoveSheetSlot}
          />
        )}

        {activeTab === 'inventarios' && (
          <InventoryModule
            inventory={inventory}
            movements={movements}
            onOpenMovementModal={(item) => {
              setPreselectedInventoryItem(item);
              setIsMovementModalOpen(true);
            }}
            onQuickAdjust={handleQuickAdjust}
          />
        )}

        {activeTab === 'abastecimiento' && (
          <ReplenishmentModule
            inventory={inventory}
            suppliers={suppliers}
            onGeneratePurchaseOrder={handleGeneratePurchaseOrder}
            onReceivePurchaseOrder={handleReceivePurchaseOrder}
            existingPOs={purchaseOrders}
          />
        )}

        {activeTab === 'distribucion' && (
          <DistributionModule
            orders={orders}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
            onViewDispatchSlip={(order) => setViewingSlipOrder(order)}
          />
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <strong>Vidriería La Primera</strong> · Guadalajara de Buga, Valle del Cauca, Colombia
          </div>
          <div>
            Fundamentos: Tompkins (Almacenamiento) · Ballou (Inventarios & Distribución) · Chopra (Abastecimiento)
          </div>
        </div>
      </footer>

      {/* Modales Interactivos */}
      <NewMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        inventory={inventory}
        preselectedItem={preselectedInventoryItem}
        onSubmit={handleMovementSubmit}
      />

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        inventory={inventory}
        onSubmit={handleNewOrderSubmit}
      />

      <DispatchSlipModal
        order={viewingSlipOrder}
        onClose={() => setViewingSlipOrder(null)}
      />

    </div>
  );
}
