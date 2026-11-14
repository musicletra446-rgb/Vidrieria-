import React, { useState } from 'react';
import { InventoryItem, MovementType } from '../types/logistics';
import { X, Check } from 'lucide-react';

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  preselectedItem?: InventoryItem;
  onSubmit: (data: {
    itemId: string;
    type: MovementType;
    quantity: number;
    reason: any;
    referenceDoc: string;
    responsible: string;
  }) => void;
}

export const NewMovementModal: React.FC<NewMovementModalProps> = ({
  isOpen,
  onClose,
  inventory,
  preselectedItem,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [itemId, setItemId] = useState<string>(preselectedItem?.id || inventory[0]?.id || '');
  const [type, setType] = useState<MovementType>('Salida');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Venta Directa');
  const [referenceDoc, setReferenceDoc] = useState<string>('FAC-BUG-' + Math.floor(1000 + Math.random() * 9000));
  const [responsible, setResponsible] = useState<string>('Maestro Cortador Carlos Buga');

  const selectedItem = inventory.find((i) => i.id === itemId) || inventory[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    onSubmit({
      itemId,
      type,
      quantity,
      reason: reason as any,
      referenceDoc,
      responsible,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Registrar Movimiento de Inventario (Ballou)
            </h3>
            <p className="text-[11px] text-slate-500">
              Afectación directa al kardex y cálculo de existencias
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Producto o Lámina de Vidrio:
            </label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (Stock actual: {item.stock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Movimiento:
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const val = e.target.value as MovementType;
                  setType(val);
                  if (val === 'Entrada') setReason('Compra Proveedor');
                  else if (val === 'Salida') setReason('Corte para Producción');
                  else setReason('Rotura/Avería en Taller');
                }}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-hidden font-semibold"
              >
                <option value="Entrada">Entrada (+) Ingreso</option>
                <option value="Salida">Salida (-) Despacho</option>
                <option value="Merma">Merma (!) Avería / Rotura</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cantidad ({selectedItem?.unit || 'Unidades'}):
              </label>
              <input
                type="number"
                min="1"
                max={type !== 'Entrada' ? selectedItem?.stock || 999 : 999}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Motivo Operativo:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
            >
              {type === 'Entrada' && (
                <>
                  <option value="Compra Proveedor">Compra Proveedor</option>
                  <option value="Ajuste Físico">Ajuste Físico</option>
                </>
              )}
              {type === 'Salida' && (
                <>
                  <option value="Corte para Producción">Corte para Producción</option>
                  <option value="Venta Directa">Venta Directa</option>
                </>
              )}
              {type === 'Merma' && (
                <>
                  <option value="Rotura/Avería en Taller">Rotura/Avería en Taller</option>
                  <option value="Ajuste Físico">Merma de Despunte / Desperdicio</option>
                </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Documento Soporte:
              </label>
              <input
                type="text"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                placeholder="ej: FAC-0482 o PED-102"
                className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Responsable en Vidriería:
              </label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Movimiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
