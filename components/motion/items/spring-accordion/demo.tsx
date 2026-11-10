import { SpringAccordion } from './spring-accordion';

const ITEMS = [
  {
    id: 'gear',
    title: 'What should I bring?',
    content: 'Layers, soft-soled shoes and a dry bag.',
  },
  {
    id: 'weather',
    title: 'What if the weather turns?',
    content: 'We reschedule at no cost when wind passes 20 knots.',
  },
  {
    id: 'crew',
    title: 'Is there a crew?',
    content: 'A skipper and one deckhand sail with every charter.',
  },
];

export default function Demo() {
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <SpringAccordion items={ITEMS} defaultOpen='gear' />
    </div>
  );
}
