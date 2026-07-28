'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { QRCodeSVG as QRCodeSVGImpl } from 'qrcode.react';
import type { SaleCreated } from '@/lib/types';

// qrcode.react está hoisted en la raíz del monorepo y resuelve ahí @types/react —
// que en la raíz es v19 (lo necesita apps/mobile/Expo), mientras apps/web usa React
// 18 propio. Es un choque de tipos duplicados del workspace, no un bug real: este
// cast local evita que tsc lo bloquee sin tocar la resolución de tipos global (que
// rompería apps/mobile).
const QRCodeSVG = QRCodeSVGImpl as ComponentType<{ value: string; size?: number; level?: string }>;

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function SaleQrDisplay({ sale, onNewSale }: { sale: SaleCreated; onNewSale: () => void }) {
  const expiresAt = new Date(sale.qrExpiresAt).getTime();
  const [msRemaining, setMsRemaining] = useState(() => expiresAt - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setMsRemaining(expiresAt - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const expired = msRemaining <= 0;

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div>
        <p className="text-sm text-gray-500">Importe total</p>
        <p className="text-3xl font-bold text-gray-900">{sale.totalAmount.toFixed(2)}€</p>
      </div>

      <div className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 ${expired ? 'opacity-30' : ''}`}>
        <QRCodeSVG value={sale.qrToken} size={260} level="M" />
      </div>

      {expired ? (
        <p className="text-lg font-semibold text-red-600">QR caducado</p>
      ) : (
        <p className="text-lg font-semibold text-gray-900">
          Caduca en <span className="font-mono">{formatCountdown(msRemaining)}</span>
        </p>
      )}

      <p className="max-w-xs text-sm text-gray-500">
        Pide al cliente que escanee este código con la app de LocalNow para vincular la compra a sus puntos.
      </p>

      <button
        type="button"
        onClick={onNewSale}
        className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Nueva venta
      </button>
    </div>
  );
}
