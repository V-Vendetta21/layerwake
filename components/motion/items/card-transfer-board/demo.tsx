import { useState } from 'react';
import { CardTransferBoard } from './card-transfer-board';

const COLUMNS = [
  { id: 'todo', title: 'To check' },
  { id: 'done', title: 'Checked' },
];

export default function Demo() {
  const [cards, setCards] = useState([
    { id: 'a', title: 'Bilge pump', column: 'todo' },
    { id: 'b', title: 'Nav lights', column: 'todo' },
    { id: 'c', title: 'Flares', column: 'todo' },
    { id: 'd', title: 'Anchor', column: 'done' },
  ]);
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <CardTransferBoard
        columns={COLUMNS}
        cards={cards}
        onMove={(id, column) =>
          setCards((list) => [
            ...list.filter((c) => c.id !== id),
            { ...list.find((c) => c.id === id)!, column },
          ])
        }
      />
    </div>
  );
}
