import { useState } from 'react';
import { RouteTransitionCurtain } from './route-transition-curtain';

const VIEWS = [
  {
    id: 'plan',
    title: 'Plan',
    content: (
      <p style={{ margin: 0 }}>
        Depart 06:30 on the ebb. Arrive before the sea breeze.
      </p>
    ),
  },
  {
    id: 'crew',
    title: 'Crew',
    content: <p style={{ margin: 0 }}>Skipper, navigator and one deckhand.</p>,
  },
  {
    id: 'kit',
    title: 'Kit',
    content: (
      <p style={{ margin: 0 }}>
        Lifejackets, radio, flares, spare line and a paper chart.
      </p>
    ),
  },
];

export default function Demo() {
  const [view, setView] = useState('plan');
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <RouteTransitionCurtain
        views={VIEWS}
        current={view}
        onNavigate={setView}
        label='Trip sections'
      />
    </div>
  );
}
