import { useState } from 'react';
import { TokenChipEntry } from './token-chip-entry';

export default function Demo() {
  const [tags, setTags] = useState(['Sailing', 'Coastal']);
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <TokenChipEntry value={tags} onChange={setTags} label='Trip tags' />
    </div>
  );
}
