import { useState } from 'react';
import { SlidingPagination } from './sliding-pagination';

const BUOYS = Array.from(
  { length: 11 },
  (_, i) =>
    `Buoy ${String.fromCharCode(65 + i)} · ${(1.2 + i * 0.4).toFixed(1)} nm`
);

export default function Demo() {
  const [page, setPage] = useState({ now: 1, before: 1 });
  return (
    <div style={{ width: 300, maxWidth: '100%' }}>
      <SlidingPagination
        items={BUOYS}
        pageSize={4}
        page={page.now}
        previousPage={page.before}
        onPageChange={(next) => setPage((p) => ({ now: next, before: p.now }))}
        renderItem={(item) => item}
        label='Buoy list pages'
      />
    </div>
  );
}
