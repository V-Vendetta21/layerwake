import { useState } from 'react';
import { CommandPalette, type Command } from './command-palette';

const COMMANDS: Command[] = [
  { id: 'route', label: 'Plot a new route', hint: 'R' },
  { id: 'tide', label: 'Show tide table', hint: 'T' },
  { id: 'weather', label: 'Check the forecast', hint: 'W' },
  { id: 'log', label: 'Open the logbook', hint: 'L' },
  { id: 'crew', label: 'Message the crew', hint: 'M' },
];

export default function Demo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
      <CommandPalette
        commands={COMMANDS}
        label='Open command palette'
        onRun={(c) => setLast(c.label)}
      />
      <span role='status' style={{ color: '#b8b8b8' }}>
        {last ? `Ran: ${last}` : 'Press Ctrl+K or ⌘K, or use the button.'}
      </span>
    </div>
  );
}
