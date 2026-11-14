import React, { useState } from 'react';
import { StorageRack, GlassSheet, BlockageIssue } from '../types/logistics';
import {
  Warehouse,
  AlertTriangle,
  CheckCircle,
  MoveUp,
  MoveDown,
  Sparkles,
  ShieldCheck,
  Info,
  Maximize2,
  HardHat,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';

interface StorageModuleProps {
  racks: StorageRack[];
  blockages: BlockageIssue[];
  onOptimizeRack: (rackId: string) => void;
  onMoveSheetSlot: (rackId: string, sheetId: string, direction: 'up' | 'down') => void;
}

export const StorageModule: React.FC<StorageModuleProps> = ({
  racks,
  blockages,
  onOptimizeRack,
  onMoveSheetSlot,
}) => {
  const [selectedRackId, setSelectedRackId] = useState<string>(racks[0]?.id || 'rack-a1');
  const selectedRack = racks.find((r) => r.id === selectedRackId) || racks[0];

  const selectedRackBlockages = blockages.filter((b) => b.rackId === selectedRack.id);

  // Colores según rotación ABC de Tompkins
  const getRotationBadge = (rotation: string) => {
    switch (rotation) {
      case 'A':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'B':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      case 'C':
        return 'text-slate-700 bg-slate-100 border border-slate-300';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getRotationLabel = (rotation: string) => {
    switch (rotation) {
      case 'A':
        return 'Alta Rotación (Uso Diario)';
      case 'B':
        return 'Media Rotación (Semanal)';
      case 'C':
        return 'Baja Rotación (Especial / Pesado)';
      default:
        return rotation;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo con Fundamentación Teórica */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 uppercase tracking-wide">
              <span>Módulo 1</span>
              <span>·</span>
              <span>Fundamento Teórico: James A. Tompkins (Facilities Planning)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Gestión de Almacenamiento & Distribución Física en Bodega
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Según <strong>James A. Tompkins</strong>, la distribución de planta debe minimizar el esfuerzo de transporte, suprimir la <em>doble manipulación</em> y agrupar materiales según su frecuencia de uso (Clasificación ABC). En el manejo de láminas de vidrio, colocar calibres pesados o de baja rotación en el frente de un caballete representa un grave riesgo de rotura y accidentes laborales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {blockages.length > 0 ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{blockages.length} Bloqueos Críticos Activos</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bodega Optimizada (0 Bloqueos)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de bloqueo detallada si el caballete seleccionado o la bodega tiene fallas */}
      {selectedRackBlockages.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-lg shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Infracción de Almacenamiento Detectada en {selectedRack.code}
                </h4>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  {selectedRackBlockages[0].reason}
                </p>
                <div className="mt-2 text-xs text-amber-800 font-medium">
                  Impacto: Para acceder a la lámina de alta demanda se requiere remover previamente láminas que pesan más de 170 kg, elevando exponencialmente el tiempo de preparación y riesgo de fisuras.
                </div>
              </div>
            </div>

            <button
              onClick={() => onOptimizeRack(selectedRack.id)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap self-stretch sm:self-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimizar {selectedRack.code} (Tompkins)</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid: Plano 2D de Bodega (Izquierda) + Inspección de Caballete (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Mapa 2D de la Bodega de Vidriería La Primera */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-cyan-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Plano de Planta de Bodega (Buga)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Selecciona un caballete para inspección
              </span>
            </div>

            {/* Representación visual de la planta */}
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg space-y-3">
              {/* Portón y Entrada */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-200/80 rounded border border-slate-300 text-[11px] text-slate-700 font-semibold">
                <span>PORTÓN DE DESCARGA (Vía Pública / Carrera 14)</span>
                <span className="text-[10px] text-slate-500 font-mono">Zona Acceso</span>
              </div>

              {/* Zona A - Cerca al banco de corte */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800">ZONA A · Alta Rotación</span>
                  <span className="text-[10px] text-slate-400">Adyacente a mesa de corte</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {racks.slice(0, 2).map((rack) => {
                    const isSelected = selectedRack.id === rack.id;
                    const hasIssue = blockages.some((b) => b.rackId === rack.id);
                    return (
                      <button
                        key={rack.id}
                        onClick={() => setSelectedRackId(rack.id)}
                        className={`p-2.5 rounded-lg text-left transition-all border ${
                          isSelected
                            ? 'bg-cyan-50 border-cyan-500 ring-1 ring-cyan-500'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{rack.code}</span>
                          {hasIssue ? (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="Bloqueo detectado" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Óptimo" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-1 truncate">
                          {rack.name.split('(')[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          {rack.sheets.reduce((acc, s) => acc + s.quantity, 0)} láminas · {rack.currentWeightKg} kg
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mesa Central de Corte y Biselado */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-center text-xs font-semibold text-blue-900 flex items-center justify-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Mesa Neumática de Corte y Canteado (Área de Trabajo)</span>
              </div>

              {/* Zona B & C - Media y Baja Rotación */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">ZONA B & C · Media / Especiales</span>
                  <span className="text-[10px] text-slate-400">Sector posterior</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {racks.slice(2).map((rack) => {
                    const isSelected = selectedRack.id === rack.id;
                    const hasIssue = blockages.some((b) => b.rackId === rack.id);
                    return (
                      <button
                        key={rack.id}
                        onClick={() => setSelectedRackId(rack.id)}
                        className={`p-2.5 rounded-lg text-left transition-all border ${
                          isSelected
                            ? 'bg-cyan-50 border-cyan-500 ring-1 ring-cyan-500'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{rack.code}</span>
                          {hasIssue ? (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Bloqueo activo" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Óptimo" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-1 truncate">
                          {rack.name.split('(')[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          {rack.sheets.reduce((acc, s) => acc + s.quantity, 0)} láminas · {rack.currentWeightKg} kg
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Área de Producto Terminado */}
              <div className="px-3 py-2 bg-slate-200/80 rounded border border-slate-300 text-[11px] text-slate-700 flex items-center justify-between font-medium">
                <span>Área de Empaque y Despacho de Pedidos Listos</span>
                <span className="text-[10px] text-slate-500">Salida Local</span>
              </div>
            </div>

            {/* Indicador de capacidad del caballete actual */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">
                  Capacidad Estructural {selectedRack.code}:
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {selectedRack.currentWeightKg} / {selectedRack.maxCapacityKg} kg (
                  {Math.round((selectedRack.currentWeightKg / selectedRack.maxCapacityKg) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all rounded-full ${
                    selectedRack.currentWeightKg > selectedRack.maxCapacityKg * 0.9
                      ? 'bg-rose-500'
                      : selectedRack.currentWeightKg > selectedRack.maxCapacityKg * 0.75
                      ? 'bg-amber-500'
                      : 'bg-cyan-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (selectedRack.currentWeightKg / selectedRack.maxCapacityKg) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Protocolo de Seguridad Ocupacional para Vidrio */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <HardHat className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wide">
                Protocolo de Seguridad (Norma Manipulación Vidrio)
              </h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Inclinación de caballete constante entre <strong>4° y 6°</strong> para evitar caída accidental.</li>
              <li>Uso obligatorio de <strong>ventosas de succión neumáticas</strong> dobles con indicador de vacío.</li>
              <li><strong>Guantes anticorte nivel 5</strong> y manguitos protectores para antebrazos.</li>
              <li>Transporte en posición estrictamente <strong>vertical</strong>: el vidrio plano jamás debe cargarse horizontalmente.</li>
            </ul>
          </div>
        </div>

        {/* Columna Derecha: Corte Transversal del Caballete & Reorganización Interactiva */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Inspección del {selectedRack.code}: {selectedRack.name}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                    {selectedRack.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedRack.description}
                </p>
              </div>

              <button
                onClick={() => onOptimizeRack(selectedRack.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aplicar Regla de Tompkins</span>
              </button>
            </div>

            {/* Vista Esquematizada de Ranuras / Slots del Caballete */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <span>← FRENTE DEL CABALLETE</span>
                  <span className="text-slate-400 font-normal">(Posición de extracción inmediata)</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <span className="text-slate-400 font-normal">(Fondo estructural)</span>
                  <span>FONDO →</span>
                </span>
              </div>

              <div className="space-y-3">
                {selectedRack.sheets
                  .sort((a, b) => a.slotPosition - b.slotPosition)
                  .map((sheet, idx) => {
                    // Verificar si esta lámina genera un bloqueo
                    const isBlocking = selectedRackBlockages.some(
                      (b) => b.blockingSheet.id === sheet.id
                    );
                    const isBlocked = selectedRackBlockages.some(
                      (b) => b.blockedSheet.id === sheet.id
                    );

                    return (
                      <div
                        key={sheet.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isBlocking
                            ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                            : isBlocked
                            ? 'bg-rose-50/50 border-rose-300'
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {/* Número de Ranura */}
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-mono font-bold text-xs text-slate-800 shadow-xs shrink-0">
                              #{sheet.slotPosition}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {sheet.name}
                                </span>
                                <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${getRotationBadge(sheet.rotation)}`}>
                                  Clase {sheet.rotation} · {getRotationLabel(sheet.rotation)}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                                <span>
                                  <strong>Espesor:</strong> {sheet.thicknessMm} mm
                                </span>
                                <span>·</span>
                                <span>
                                  <strong>Dimensiones:</strong> {sheet.dimensions.widthM}m × {sheet.dimensions.heightM}m
                                </span>
                                <span>·</span>
                                <span>
                                  <strong>Peso unitario:</strong>{' '}
                                  <span className="font-mono font-semibold">{sheet.weightKg} kg</span>
                                </span>
                                <span>·</span>
                                <span>
                                  <strong>Existencias en caballete:</strong>{' '}
                                  <span className="font-mono font-bold text-slate-900">{sheet.quantity}</span> hojas
                                </span>
                              </div>

                              {isBlocking && (
                                <div className="mt-2 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>
                                    Obstruye extracción: Lámina pesada/baja rotación en el frente.
                                  </span>
                                </div>
                              )}

                              {isBlocked && (
                                <div className="mt-2 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                                  <Info className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  <span>
                                    Material atrapado: Debería estar en el frente para evitar doble maniobra.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Controles para reubicar manualmente */}
                          <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => onMoveSheetSlot(selectedRack.id, sheet.id, 'up')}
                              disabled={sheet.slotPosition === 1}
                              className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-xs transition-colors"
                              title="Mover hacia el frente (más accesible)"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onMoveSheetSlot(selectedRack.id, sheet.id, 'down')}
                              disabled={sheet.slotPosition === selectedRack.sheets.length}
                              className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-xs transition-colors"
                              title="Mover hacia el fondo"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Tarjeta explicativa de la Fórmula de Cálculo de Peso de Vidrio */}
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-700" />
                <span>Cálculo Técnico de Peso de Vidrio (Física del Almacenamiento):</span>
              </div>
              <p className="font-mono text-slate-800 bg-white p-2 rounded border border-slate-200">
                Peso (kg) = Ancho (m) × Alto (m) × Espesor (mm) × 2.5 kg/(m²·mm)
              </p>
              <p className="text-[11px] text-slate-500">
                Una hoja jumbo de 10mm (3.30m × 2.14m) pesa <strong>176.5 kg</strong>. Conforme al principio de Tompkins, nunca debe interponerse entre el operario y las hojas de 4mm estándar que se cortan varias veces al día.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
