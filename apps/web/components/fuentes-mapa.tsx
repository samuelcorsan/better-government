'use client';
import { useState } from 'react';
import SourcesMap from './sources-map';

export function FuentesMapa() {
  const [selectedId, onSelect] = useState<string | null>(null);
  return (
    <div className="info-mapa">
      <SourcesMap selectedId={selectedId} onSelect={onSelect} />
    </div>
  );
}
