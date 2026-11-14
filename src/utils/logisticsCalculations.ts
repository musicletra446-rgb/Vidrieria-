import { StorageRack, GlassSheet, BlockageIssue, InventoryItem, ReorderRecommendation, Supplier } from '../types/logistics';

// Densidad estándar del vidrio de silicato sódico-cálcico: 2.5 g/cm³ = 2500 kg/m³
// Por lo tanto, 1 m² de vidrio de 1 mm de espesor pesa exactamente 2.5 kg.
export function calculateGlassWeight(widthM: number, heightM: number, thicknessMm: number): number {
  return Number((widthM * heightM * thicknessMm * 2.5).toFixed(1));
}

// Formateador de moneda en Pesos Colombianos (COP)
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

// James A. Tompkins: Detección analítica de bloqueos físicos e interferencias en caballetes
export function detectTompkinsBlockages(racks: StorageRack[]): BlockageIssue[] {
  const issues: BlockageIssue[] = [];

  const rotationRank: Record<string, number> = { A: 3, B: 2, C: 1 };

  racks.forEach((rack) => {
    const sorted = [...rack.sheets].sort((a, b) => a.slotPosition - b.slotPosition);

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const outerSheet = sorted[i]; // Está más al frente
        const innerSheet = sorted[j]; // Quedó atrapado atrás

        const outerRank = rotationRank[outerSheet.rotation] || 1;
        const innerRank = rotationRank[innerSheet.rotation] || 1;

        // Infracción 1: Material de alta rotación (ej: A) atrapado detrás de baja rotación (ej: C o B)
        if (outerRank < innerRank) {
          issues.push({
            rackId: rack.id,
            rackCode: rack.code,
            blockingSheet: outerSheet,
            blockedSheet: innerSheet,
            severity: outerRank === 1 && innerRank === 3 ? 'Alta' : 'Media',
            reason: `Lámina de rotación "${outerSheet.rotation}" (${outerSheet.name}) en posición ${outerSheet.slotPosition} bloquea a "${innerSheet.name}" de mayor rotación "${innerSheet.rotation}" en posición ${innerSheet.slotPosition}. Obliga a doble manipulación de riesgo.`,
          });
        }
        // Infracción 2: Lámina extrapesada (>120kg) en exterior bloqueando láminas de peso normal
        else if (outerSheet.weightKg > 120 && innerSheet.weightKg < 80 && outerSheet.slotPosition < innerSheet.slotPosition) {
          issues.push({
            rackId: rack.id,
            rackCode: rack.code,
            blockingSheet: outerSheet,
            blockedSheet: innerSheet,
            severity: 'Media',
            reason: `Lámina pesada de ${outerSheet.weightKg} kg en posición exterior obstruye la extracción de láminas más livianas interiores. Riesgo ergonómico y de fractura en maniobra según Tompkins.`,
          });
        }
      }
    }
  });

  return issues;
}

// James A. Tompkins: Reorganización óptima de caballete según frecuencia ABC y accesibilidad
export function optimizeRackLayout(rack: StorageRack): StorageRack {
  const rotationRank: Record<string, number> = { A: 3, B: 2, C: 1 };

  // Prioridad al frente (slot 1):
  // 1. Mayor rotación (A primero, luego B, luego C)
  // 2. A igual rotación, menor peso al frente para ergonomía
  const sortedSheets = [...rack.sheets].sort((a, b) => {
    const rankDiff = (rotationRank[b.rotation] || 1) - (rotationRank[a.rotation] || 1);
    if (rankDiff !== 0) return rankDiff;
    return a.weightKg - b.weightKg;
  });

  const reindexed = sortedSheets.map((sheet, index) => ({
    ...sheet,
    slotPosition: index + 1,
  }));

  return {
    ...rack,
    sheets: reindexed,
  };
}

// Sunil Chopra: Cálculo de Reabastecimiento, EOQ y Punto de Reorden (ROP)
export function calculateChopraReplenishment(
  items: InventoryItem[],
  suppliers: Supplier[]
): ReorderRecommendation[] {
  return items
    .filter((item) => item.category === 'Láminas de Vidrio')
    .map((item) => {
      // Supongamos un consumo diario estimado según rotación
      const avgDailyDemand = item.rotation === 'A' ? 3.5 : item.rotation === 'B' ? 1.4 : 0.4; // láminas/día
      const annualDemand = avgDailyDemand * 300; // 300 días operativos al año

      // Buscar proveedor más idóneo según especialidad
      const supplier = suppliers.find((s) =>
        s.specialties.some((spec) => item.name.toLowerCase().includes(spec.toLowerCase().split(' ')[0]))
      ) || suppliers[0];

      const leadTime = supplier.leadTimeDays;
      const safetyStock = item.safetyStock;

      // Punto de Reorden (Chopra): ROP = (Demanda diaria * Lead time) + Stock de seguridad
      const reorderPoint = Math.ceil(avgDailyDemand * leadTime + safetyStock);

      // EOQ (Modelo Wilson / Chopra): EOQ = sqrt((2 * D * S) / H)
      // Costo fijo de emitir orden (S): COP $80,000 (fletes compartidos, llamadas, gestión)
      // Costo de almacenamiento anual (H): 20% del valor unitario
      const S = 80000;
      const H = item.unitCostCOP * 0.20;
      const eoqRaw = Math.sqrt((2 * annualDemand * S) / H);
      const economicOrderQuantity = Math.max(10, Math.ceil(eoqRaw));

      const needsReorder = item.stock <= reorderPoint;
      const recommendedOrderQty = needsReorder ? Math.max(economicOrderQuantity, (reorderPoint * 2) - item.stock) : 0;
      const estimatedCostCOP = recommendedOrderQty * item.unitCostCOP;

      const urgency: 'Crítica' | 'Media' | 'Normal' =
        item.stock <= item.safetyStock
          ? 'Crítica'
          : item.stock <= reorderPoint
          ? 'Media'
          : 'Normal';

      return {
        itemId: item.id,
        itemName: item.name,
        currentStock: item.stock,
        minStock: item.minStock,
        avgDailyDemand,
        suggestedSupplier: supplier,
        leadTimeDays: leadTime,
        safetyStock,
        reorderPoint,
        economicOrderQuantity,
        recommendedOrderQty,
        estimatedCostCOP,
        urgency,
      };
    });
}
