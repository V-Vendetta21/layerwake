import { ReadingProgressRail } from './reading-progress-rail';

const P = (text: string) => <p>{text}</p>;
const SECTIONS = [
  {
    id: 'plan',
    title: 'Planning',
    body: (
      <>
        {P(
          'Pick a window with the tide in your favour and a forecast you trust.'
        )}
        {P(
          'Tell someone ashore where you are going and when you will be back.'
        )}
      </>
    ),
  },
  {
    id: 'kit',
    title: 'Kit',
    body: (
      <>
        {P(
          'Lifejackets for everyone, a handheld radio and a charged phone in a dry bag.'
        )}
        {P('Spare line, a bailer, a knife and a paper chart of the area.')}
      </>
    ),
  },
  {
    id: 'route',
    title: 'Route',
    body: (
      <>
        {P(
          'Leave on the last of the flood and ride the ebb out past the point.'
        )}
        {P('Keep the red marks to port on the way out and stay off the shoal.')}
      </>
    ),
  },
  {
    id: 'return',
    title: 'Return',
    body: (
      <>
        {P('Turn back early if the wind backs south. The bay gets lumpy fast.')}
        {P(
          'Rinse the gear, log the trip and close your plan with your contact.'
        )}
      </>
    ),
  },
];

export default function Demo() {
  return (
    <div style={{ width: 380, maxWidth: '100%' }}>
      <ReadingProgressRail sections={SECTIONS} label='Day sail checklist' />
    </div>
  );
}
