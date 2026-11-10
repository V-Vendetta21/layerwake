import { KineticUnderline } from './kinetic-underline';

export default function Demo() {
  return (
    <nav
      aria-label='Example links'
      style={{ display: 'flex', gap: 28, fontSize: 18 }}
    >
      <KineticUnderline href='#kinetic-underline'>Tides</KineticUnderline>
      <KineticUnderline href='#kinetic-underline'>Charts</KineticUnderline>
      <KineticUnderline href='#kinetic-underline'>Moorings</KineticUnderline>
    </nav>
  );
}
