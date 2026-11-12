import { useState } from 'react';
import { ExpandingSearchField } from './expanding-search-field';

const HARBORS = [
  'Brest',
  'Falmouth',
  'Kinsale',
  'La Rochelle',
  'Plymouth',
  'Saint-Malo',
];

export default function Demo() {
  const [query, setQuery] = useState('');
  const results = HARBORS.filter((h) =>
    h.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div
      style={{
        width: 320,
        maxWidth: '100%',
        padding: 12,
        border: '1px solid #d6def2',
        borderRadius: 12,
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <strong style={{ flex: 'none' }}>Harbors</strong>
        <ExpandingSearchField
          value={query}
          onValueChange={setQuery}
          label='Search harbors'
          controls='harbor-results'
        />
      </div>
      <ul
        id='harbor-results'
        style={{
          margin: '10px 0 0',
          padding: 0,
          listStyle: 'none',
          color: '#46527a',
          minHeight: 132,
        }}
      >
        {results.map((h) => (
          <li key={h} style={{ padding: '3px 0' }}>
            {h}
          </li>
        ))}
        {results.length === 0 ? <li>No harbor matches “{query}”.</li> : null}
      </ul>
    </div>
  );
}
