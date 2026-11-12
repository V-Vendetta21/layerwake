/**
 * The original Layerwake demo component: a coastal weather card.
 * It is ordinary HTML and CSS (see `.coast-card` in layerwake.css) so the
 * extension can capture it like any other component. The bundled demo capture
 * in lib/layerwake/demo-capture.json was produced from this markup.
 */
export function DemoCard() {
  return (
    <article className='coast-card' data-demo-component=''>
      <div className='coast-card__top'>
        <span className='coast-card__label'>Harbor forecast</span>
        <span className='coast-card__badge'>Low swell</span>
      </div>
      <h3 className='coast-card__headline'>Calm seas until dusk</h3>
      <p className='coast-card__body'>
        Light westerly wind, a clear horizon and a slow incoming tide.
      </p>
      <div className='coast-card__stats'>
        <div className='coast-card__stat'>
          <span className='coast-card__value'>14°</span>
          <span className='coast-card__unit'>Water</span>
        </div>
        <div className='coast-card__stat'>
          <span className='coast-card__value'>9 kn</span>
          <span className='coast-card__unit'>Wind</span>
        </div>
        <div className='coast-card__stat'>
          <span className='coast-card__value'>0.6 m</span>
          <span className='coast-card__unit'>Swell</span>
        </div>
      </div>
      <div className='coast-card__footer'>
        <svg
          className='coast-card__icon'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#164CFF'
          strokeWidth='2'
          strokeLinecap='round'
          aria-hidden='true'
        >
          <path d='M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2' />
          <path d='M2 16c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2' />
        </svg>
        <span className='coast-card__time'>Updated 6 min ago</span>
        <button type='button' className='coast-card__action'>
          Tide chart
        </button>
      </div>
    </article>
  );
}
