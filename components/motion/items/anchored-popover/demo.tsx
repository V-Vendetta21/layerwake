import { AnchoredPopover } from './anchored-popover';

export default function Demo() {
  return (
    // The popover stays inside this marked box, flipping or shifting as needed.
    <div
      data-popover-boundary=''
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: 340,
        maxWidth: '100%',
        height: 230,
        padding: 12,
        border: '1px dashed #474747',
        borderRadius: 12,
      }}
    >
      <AnchoredPopover label='Wind info' title='Wind information'>
        <strong style={{ color: '#ffffff' }}>West 12 kn</strong>
        <span>Gusting 18 kn after 15:00.</span>
      </AnchoredPopover>
      <AnchoredPopover label='Tide info' title='Tide information'>
        <strong style={{ color: '#ffffff' }}>Flooding</strong>
        <span>High water at 14:20, 4.6 m.</span>
      </AnchoredPopover>
    </div>
  );
}
