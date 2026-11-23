/**
 * A circular reveal: the incoming theme grows out of the control that asked
 * for it. Two callers share this file:
 *
 * - the gallery panel, which confines the circle to its own box
 *   (`revealCircle`), and
 * - the whole page, which reveals the new theme across the document with the
 *   View Transitions API (`revealDocument`).
 */

export const REVEAL_MS = 480;
export const REVEAL_EASING = 'cubic-bezier(0.6, 0, 0.3, 1)';

export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RevealCircle {
  /** Centre, relative to the bounds' top-left corner. */
  x: number;
  y: number;
  /** Large enough to reach the farthest corner of the bounds. */
  r: number;
}

/** The circle that starts at the trigger's centre and covers the bounds. */
export function revealCircle(trigger: Bounds, bounds: Bounds): RevealCircle {
  const x = trigger.left + trigger.width / 2 - bounds.left;
  const y = trigger.top + trigger.height / 2 - bounds.top;
  const reach = Math.hypot(
    Math.max(x, bounds.width - x),
    Math.max(y, bounds.height - y)
  );
  // One extra pixel so anti-aliasing never leaves a sliver in the corner.
  return { x, y, r: Math.ceil(reach) + 1 };
}

type ViewTransitionLike = {
  ready: Promise<unknown>;
  finished: Promise<unknown>;
  skipTransition: () => void;
};

type DocumentWithTransitions = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>
  ) => ViewTransitionLike;
};

/** True when the page can animate a document-wide reveal right now. */
export function canRevealDocument(): boolean {
  if (typeof document === 'undefined') return false;
  if (
    typeof (document as DocumentWithTransitions).startViewTransition !==
    'function'
  )
    return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Calls queue behind each other, so two reveals never overlap.
let queue: Promise<void> = Promise.resolve();

/**
 * Runs `apply` (which must switch the theme) inside a circle that grows from
 * `trigger` and fills the viewport. `apply` runs exactly once, whatever
 * happens: without the API, with reduced motion, or if the animation fails,
 * the theme still changes, just without the circle.
 *
 * The circle is centred on the trigger's real viewport position, so it is
 * correct when the page is scrolled or has a scrollbar. Temporary styles are
 * removed when the reveal ends.
 */
export function revealDocument(
  apply: () => void | Promise<void>,
  trigger: Element | null,
  options: { duration?: number; easing?: string } = {}
): Promise<void> {
  const run = () => reveal(apply, trigger, options);
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

async function reveal(
  apply: () => void | Promise<void>,
  trigger: Element | null,
  {
    duration = REVEAL_MS,
    easing = REVEAL_EASING,
  }: { duration?: number; easing?: string }
): Promise<void> {
  if (!trigger || !canRevealDocument()) {
    await apply();
    return;
  }

  let applied = false;
  const once = async () => {
    if (applied) return;
    applied = true;
    await apply();
  };

  const origin = revealCircle(trigger.getBoundingClientRect(), {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // The browser fades the old and new snapshots by default. A circle needs
  // both fully opaque, with the new one on top.
  const style = document.createElement('style');
  style.textContent =
    '::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}' +
    '::view-transition-old(root){z-index:1}::view-transition-new(root){z-index:2}';
  document.head.append(style);

  let transition: ViewTransitionLike | undefined;
  try {
    transition = (document as DocumentWithTransitions).startViewTransition!(
      once
    );
    await transition.ready;
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${origin.x}px ${origin.y}px)`,
          `circle(${origin.r}px at ${origin.x}px ${origin.y}px)`,
        ],
      },
      { duration, easing, pseudoElement: '::view-transition-new(root)' }
    );
    await transition.finished;
  } catch {
    // Skipped, interrupted or unsupported: end the animation and make sure
    // the theme still changed.
    try {
      transition?.skipTransition();
    } catch {}
    await transition?.finished.catch(() => undefined);
    await once();
  } finally {
    style.remove();
  }
}
