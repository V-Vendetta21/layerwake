'use client';

import { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon } from './icons';

/**
 * The home page's looping background: a blurred black-and-white sea, held
 * under a dark wash so text keeps its contrast. It never plays for people who
 * ask for reduced motion, and a button pauses it for everyone else.
 */
export function HomeBackdrop() {
  const video = useRef<HTMLVideoElement>(null);
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
      <div className='lw-backdrop' aria-hidden='true'>
        <video
          ref={video}
          className='lw-backdrop__video'
          poster='/media/waves-poster.jpg'
          muted
          loop
          playsInline
          preload='auto'
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src='/media/waves.webm' type='video/webm' />
          <source src='/media/waves.mp4' type='video/mp4' />
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
