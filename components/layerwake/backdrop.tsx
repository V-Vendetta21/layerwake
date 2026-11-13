'use client';

import { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon } from './icons';

/**
 * The looping black-and-white sea. It plays sharp behind the home page and
 * blurred behind the gallery, the demo page and the workspace import screen,
 * held under a dark wash so text keeps its contrast. It never plays for
 * people who ask for reduced motion, and a button pauses it for everyone else.
 */
export function WaveBackdrop({
  blurred = false,
  contained = false,
}: {
  /** Softens the sea for pages where it sits behind denser content. */
  blurred?: boolean;
  /** Fills the nearest positioned parent instead of the whole viewport. */
  contained?: boolean;
} = {}) {
  const video = useRef<HTMLVideoElement>(null);
  // The blur is baked into its own clip: a live CSS blur on a full-screen
  // video costs a repaint every frame.
  const clip = blurred ? 'waves-soft' : 'waves';
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reduce.matches) el.play().catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  };

  return (
    <>
      <div
        className='lw-backdrop'
        data-blurred={blurred || undefined}
        data-contained={contained || undefined}
        aria-hidden='true'
      >
        <video
          ref={video}
          className='lw-backdrop__video'
          poster={`/media/${clip}-poster.jpg`}
          muted
          loop
          playsInline
          preload='auto'
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={`/media/${clip}.webm`} type='video/webm' />
          <source src={`/media/${clip}.mp4`} type='video/mp4' />
        </video>
      </div>
      <button type='button' className='lw-backdrop__toggle' onClick={toggle}>
        {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
        <span className='lw-sr'>
          {playing ? 'Pause background video' : 'Play background video'}
        </span>
      </button>
    </>
  );
}
