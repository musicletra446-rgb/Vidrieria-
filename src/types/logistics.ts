/**
 * Definiciones de tipos para el Sistema Logístico de Vidriería La Primera (Buga)
 * Fundamentado en:
 * - James A. Tompkins: Almacenamiento y manejo de materiales
 * - Ronald H. Ballou: Control de inventarios y distribución física
 * - Sunil Chopra: Abastecimiento y gestión de cadena de suministro
 */

export type ModuleTab = 'resumen' | 'almacenamiento' | 'inventarios' | 'abastecimiento' | 'distribucion';

export type RotationClass = 'A' | 'B' | 'C'; // A: Alta rotación, B: Media rotación, C: Baja rotación

export interface GlassSheet {
  id: string;
  reference: string;
  name: string;
  thicknessMm: number; // 3, 4, 5, 6, 8, 10 mm
  type: 'Claro' | 'Bronce' | 'Reflectivo' | 'Templado' | 'Laminado' | 'Espejo';
  dimensions: {
    widthM: number;
    heightM: number;
  };
  weightKg: number; // Calculado: ancho * alto * espesor * 2.5 kg/(m2*mm)
  rotation: RotationClass;
  slotPosition: number; // 1 (Frente/Exterior - más accesible) a N (Fondo/Interior)
  quantity: number;
}

export interface StorageRack {
  id: string;
  code: string; // ej: "CAB-A1", "CAB-A2", "CAB-B1"
  name: string;
  type: 'Caballete Tipo A' | 'Estantería Vertical Espejos' | 'Caballete Cantilever';
  zone: 'Zona A (Alta Rotación)' | 'Zona B (Media Rotación)' | 'Zona C (Baja / Especiales)';
  maxCapacityKg: number;
  currentWeightKg: number;
  sheets: GlassSheet[];
  description: string;
}

export interface BlockageIssue {
  rackId: string;
  rackCode: string;
  blockingSheet: GlassSheet; // Lámina que está al frente (slotPosition menor)
  blockedSheet: GlassSheet;  // Lámina de mayor rotación que quedó atrapada atrás
  severity: 'Alta' | 'Media';
  reason: string;
}

export type ProductCategory = 'Láminas de Vidrio' | 'Mesas de Vidrio' | 'Espejos' | 'Cuadros' | 'Ventanas';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  specifications: string;
  unit: 'Láminas' | 'Unidades' | 'Metros²';
  stock: number;
  minStock: number;
  safetyStock: number;
  unitCostCOP: number;
  unitPriceCOP: number;
  location: string;
  rotation: RotationClass;
  lastUpdated: string;
}

export type MovementType = 'Entrada' | 'Salida' | 'Merma';

export interface InventoryMovement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  reason: 'Compra Proveedor' | 'Venta Directa' | 'Corte para Producción' | 'Rotura/Avería en Taller' | 'Ajuste Físico';
  referenceDoc: string; // ej: "FAC-8492", "PED-034", "MERMA-12"
  responsible: string;
}

export interface Supplier {
  id: string;
  name: string;
  location: string; // ej: "Yumbo, Valle", "Cali, Valle", "Buga, Valle"
  contactPerson: string;
  phone: string;
  leadTimeDays: number; // Tiempo de entrega en días (L en modelo Chopra)
  reliabilityScore: number; // 1 a 100%
  minOrderCOP: number;
  specialties: string[];
}

export interface ReorderRecommendation {
  itemId: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  avgDailyDemand: number;
  suggestedSupplier: Supplier;
  leadTimeDays: number;
  safetyStock: number;
  reorderPoint: number; // ROP = d * L + SS
  economicOrderQuantity: number; // EOQ
  recommendedOrderQty: number;
  estimatedCostCOP: number;
  urgency: 'Crítica' | 'Media' | 'Normal';
}

export interface PurchaseOrder {
  id: string;
  code: string; // ej: "OC-2026-004"
  date: string;
  supplierId: string;
  supplierName: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    unitCostCOP: number;
    subtotalCOP: number;
  }[];
  totalCOP: number;
  status: 'Borrador' | 'Enviada' | 'Recibida en Bodega';
  expectedDelivery: string;
  notes: string;
}

export type OrderStatus = 'Recibido' | 'En Producción' | 'Listo para Despacho' | 'Entregado';

export interface DispatchOrder {
  id: string;
  orderNumber: string; // ej: "PED-BUG-108"
  date: string;
  customerName: string;
  customerPhone: string;
  channel: 'WhatsApp' | 'Teléfono' | 'Mostrador Local';
  deliveryAddress: string;
  neighborhood: string; // Barrios de Buga: Santa Bárbara, Centro, El Molino, etc.
  items: {
    description: string;
    quantity: number;
    dimensions?: string;
  }[];
  totalCOP: number;
  status: OrderStatus;
  deliveryType: 'Domicilio Vidriería (Camioneta)' | 'Domicilio Motocarguero' | 'Retiro en Taller';
  driverName?: string;
  fragilityProtocol: 'Caballete con Esquinero' | 'Embalaje con Plástico Burbuja' | 'Sujeción Neumática';
  estimatedDeliveryTime: string;
  notes: string;
}
