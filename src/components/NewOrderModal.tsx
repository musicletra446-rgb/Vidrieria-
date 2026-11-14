import React, { useState } from 'react';
import { DispatchOrder, InventoryItem } from '../types/logistics';
import { X, Check, Phone, MessageCircle } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onSubmit: (newOrder: Omit<DispatchOrder, 'id'>) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+57 3');
  const [channel, setChannel] = useState<'WhatsApp' | 'Teléfono' | 'Mostrador Local'>('WhatsApp');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Barrio Santa Bárbara');
  const [selectedItemSku, setSelectedItemSku] = useState(inventory[0]?.sku || '');
  const [quantity, setQuantity] = useState(1);
  const [customDimensions, setCustomDimensions] = useState('1.20 x 0.80m');
  const [deliveryType, setDeliveryType] = useState<'Domicilio Vidriería (Camioneta)' | 'Domicilio Motocarguero' | 'Retiro en Taller'>('Domicilio Vidriería (Camioneta)');
  const [fragilityProtocol, setFragilityProtocol] = useState<'Caballete con Esquinero' | 'Embalaje con Plástico Burbuja' | 'Sujeción Neumática'>('Caballete con Esquinero');
  const [notes, setNotes] = useState('Manipular con guantes y ventosas de succión.');

  const selectedItem = inventory.find((i) => i.sku === selectedItemSku) || inventory[0];
  const calculatedTotalCOP = selectedItem ? selectedItem.unitPriceCOP * quantity : 150000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !deliveryAddress) return;

    const orderNumber = `PED-BUG-${Math.floor(112 + Math.random() * 880)}`;

    onSubmit({
      orderNumber,
      date: new Date().toISOString().split('T')[0],
      customerName,
      customerPhone,
      channel,
      deliveryAddress,
      neighborhood,
      items: [
        {
          description: selectedItem.name,
          quantity,
          dimensions: customDimensions,
        },
      ],
      totalCOP: calculatedTotalCOP,
      status: 'Recibido',
      deliveryType,
      fragilityProtocol,
      estimatedDeliveryTime: 'Hoy 04:30 PM',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Registrar Nuevo Pedido (Distribución Ballou)
            </h3>
            <p className="text-[11px] text-slate-500">
              Coordinación para clientes en Guadalajara de Buga
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre del Cliente:
              </label>
              <input
                type="text"
                placeholder="ej: Arq. Fernando Castro"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-teal-600 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Canal de Recepción:
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:ring-1 focus:ring-teal-600 focus:outline-hidden"
              >
                <option value="WhatsApp">WhatsApp Comercial</option>
                <option value="Teléfono">Llamada Telefónica</option>
                <option value="Mostrador Local">Mostrador en Vidriería</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teléfono / WhatsApp:
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:ring-1 focus:ring-teal-600 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Barrio / Sector de Buga:
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:ring-1 focus:ring-teal-600 focus:outline-hidden"
              >
                <option value="Barrio Santa Bárbara">Barrio Santa Bárbara</option>
                <option value="Barrio Centro">Barrio Centro</option>
                <option value="Barrio El Molino">Barrio El Molino</option>
                <option value="Barrio San Vicente">Barrio San Vicente</option>
                <option value="Barrio Divino Niño">Barrio Divino Niño</option>
                <option value="Barrio Paloblanco">Barrio Paloblanco</option>
                <option value="Chambimbal">Chambimbal (Rural)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Dirección de Entrega:
            </label>
            <input
              type="text"
              placeholder="ej: Carrera 13 # 4-50 frente al parque"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-teal-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="font-bold text-slate-800">Producto Solicitado:</span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <select
                  value={selectedItemSku}
                  onChange={(e) => setSelectedItemSku(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
                >
                  {inventory.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 font-mono text-center font-bold"
                  placeholder="Cantidad"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[11px] text-slate-500">Medidas de Corte:</span>
                <input
                  type="text"
                  value={customDimensions}
                  onChange={(e) => setCustomDimensions(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1 font-mono text-[11px]"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Tipo de Vehículo:</span>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white"
                >
                  <option value="Domicilio Vidriería (Camioneta)">Camioneta Estacas Caballete</option>
                  <option value="Domicilio Motocarguero">Motocarguero Urbano</option>
                  <option value="Retiro en Taller">Retiro en Local Buga</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Protocolo de Fragilidad (Ballou):
              </label>
              <select
                value={fragilityProtocol}
                onChange={(e) => setFragilityProtocol(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white"
              >
                <option value="Caballete con Esquinero">Caballete con Esquinero</option>
                <option value="Embalaje con Plástico Burbuja">Embalaje con Plástico Burbuja</option>
                <option value="Sujeción Neumática">Sujeción Neumática</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instrucciones de Despacho:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-1.5"
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
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Crear Pedido e Ingresar a Taller</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
