import dynamic from 'next/dynamic';
import React from 'react';

const MapMock = dynamic(() => import('@/components/MapMock'), { ssr: false });

export default async function AdminMap() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Live Map</h2>
      <div className="h-[500px] border rounded">
        <MapMock />
      </div>
    </div>
  );
}
