import type { ComponentType } from 'react';
import sources from './sources.generated.json';
import Demo0 from './items/staggered-text/demo';
import Demo1 from './items/scramble-text/demo';
import Demo2 from './items/rolling-counter/demo';
import Demo3 from './items/kinetic-underline/demo';
import Demo4 from './items/rotating-headline/demo';
import Demo5 from './items/typewriter-queue/demo';
import Demo6 from './items/spotlight-card/demo';
import Demo7 from './items/magnetic-button/demo';
import Demo8 from './items/hover-lift-card/demo';
import Demo9 from './items/press-ripple/demo';
import Demo10 from './items/border-sweep/demo';
import Demo11 from './items/expandable-card/demo';
import Demo12 from './items/animated-tabs/demo';
import Demo13 from './items/spring-accordion/demo';
import Demo14 from './items/segmented-switch/demo';
import Demo15 from './items/dock-magnifier/demo';
import Demo16 from './items/slide-over-sheet/demo';
import Demo17 from './items/shared-layout-grid/demo';
import Demo18 from './items/morphing-status-badge/demo';
import Demo19 from './items/progress-ring/demo';
import Demo20 from './items/skeleton-sweep/demo';
import Demo21 from './items/toast-stack/demo';
import Demo22 from './items/animated-stepper/demo';
import Demo23 from './items/scroll-reveal/demo';

export type MotionCategory = 'text' | 'cards' | 'layout' | 'status';

export const CATEGORIES: { id: MotionCategory; label: string }[] = [
  { id: 'text', label: 'Text and numbers' },
  { id: 'cards', label: 'Cards and buttons' },
  { id: 'layout', label: 'Layout and controls' },
  { id: 'status', label: 'Status and feedback' },
];

export interface MotionEntry {
  /** Folder name, file name and page anchor. */
  slug: string;
  name: string;
  purpose: string;
  category: MotionCategory;
  /** How to trigger the demo. */
  cue: string;
  /** True when the demo plays on entry, so "Replay" is the natural control. */
  replays: boolean;
  /** The usage example. The Code tab shows this same file. */
  Demo: ComponentType;
}

export interface MotionSource {
  component: string;
  css: string;
  usage: string;
}

export const SOURCES = sources as Record<string, MotionSource>;

export const ENTRIES: MotionEntry[] = [
  {
    slug: 'staggered-text',
    name: 'Staggered Text',
    purpose: 'Brings a sentence in one word at a time.',
    category: 'text',
    cue: 'Plays on entry. Use Replay to see it again.',
    replays: true,
    Demo: Demo0,
  },
  {
    slug: 'scramble-text',
    name: 'Scramble Text',
    purpose: 'Resolves random characters into the final string.',
    category: 'text',
    cue: 'Plays on entry. Use Replay to see it again.',
    replays: true,
    Demo: Demo1,
  },
  {
    slug: 'rolling-counter',
    name: 'Rolling Counter',
    purpose: 'Rolls each digit to its new value when a number changes.',
    category: 'text',
    cue: 'Tap the buttons to change the value.',
    replays: false,
    Demo: Demo2,
  },
  {
    slug: 'kinetic-underline',
    name: 'Kinetic Underline',
    purpose: 'Draws a link underline in on hover or focus.',
    category: 'text',
    cue: 'Hover a link, or Tab to it.',
    replays: false,
    Demo: Demo3,
  },
  {
    slug: 'rotating-headline',
    name: 'Rotating Headline',
    purpose: 'Cycles one part of a headline through a set of phrases.',
    category: 'text',
    cue: 'Runs on its own while in view.',
    replays: true,
    Demo: Demo4,
  },
  {
    slug: 'typewriter-queue',
    name: 'Typewriter Queue',
    purpose: 'Types, holds and removes a queue of phrases in order.',
    category: 'text',
    cue: 'Runs on its own while in view.',
    replays: true,
    Demo: Demo5,
  },
  {
    slug: 'spotlight-card',
    name: 'Spotlight Card',
    purpose: 'Lights a card with a glow that follows the pointer.',
    category: 'cards',
    cue: 'Move the pointer over the card, or Tab into it.',
    replays: false,
    Demo: Demo6,
  },
  {
    slug: 'magnetic-button',
    name: 'Magnetic Button',
    purpose: 'Pulls a button label toward the pointer within a small bound.',
    category: 'cards',
    cue: 'Move the pointer across the button.',
    replays: false,
    Demo: Demo7,
  },
  {
    slug: 'hover-lift-card',
    name: 'Hover Lift Card',
    purpose: 'Raises a linked card on hover or keyboard focus.',
    category: 'cards',
    cue: 'Hover the card, or Tab to it.',
    replays: false,
    Demo: Demo8,
  },
  {
    slug: 'press-ripple',
    name: 'Press Ripple',
    purpose: 'Spreads a ripple from the point where a button is pressed.',
    category: 'cards',
    cue: 'Tap or click the button, or press Enter on it.',
    replays: false,
    Demo: Demo9,
  },
  {
    slug: 'border-sweep',
    name: 'Border Sweep',
    purpose: 'Sends a highlight around the edge of a frame.',
    category: 'cards',
    cue: 'Runs on its own while in view.',
    replays: false,
    Demo: Demo10,
  },
  {
    slug: 'expandable-card',
    name: 'Expandable Card',
    purpose: 'Grows a card to reveal extra detail.',
    category: 'cards',
    cue: 'Tap the card header, or press Enter on it.',
    replays: false,
    Demo: Demo11,
  },
  {
    slug: 'animated-tabs',
    name: 'Animated Tabs',
    purpose: 'Slides an indicator to the active tab.',
    category: 'layout',
    cue: 'Tap a tab, or use the arrow keys.',
    replays: false,
    Demo: Demo12,
  },
  {
    slug: 'spring-accordion',
    name: 'Spring Accordion',
    purpose: 'Opens and closes sections with a slight spring.',
    category: 'layout',
    cue: 'Tap a question, or press Enter on it.',
    replays: false,
    Demo: Demo13,
  },
  {
    slug: 'segmented-switch',
    name: 'Segmented Switch',
    purpose: 'Slides a thumb to the chosen option.',
    category: 'layout',
    cue: 'Tap an option, or use the arrow keys.',
    replays: false,
    Demo: Demo14,
  },
  {
    slug: 'dock-magnifier',
    name: 'Dock Magnifier',
    purpose: 'Scales toolbar items by their distance from the pointer.',
    category: 'layout',
    cue: 'Move the pointer along the dock, or Tab through it.',
    replays: false,
    Demo: Demo15,
  },
  {
    slug: 'slide-over-sheet',
    name: 'Slide-over Sheet',
    purpose: 'Slides a focus-managed panel in from the edge.',
    category: 'layout',
    cue: 'Open the sheet. Esc or the backdrop closes it.',
    replays: false,
    Demo: Demo16,
  },
  {
    slug: 'shared-layout-grid',
    name: 'Shared Layout Grid',
    purpose: 'Moves grid items to their new places when the list is filtered.',
    category: 'layout',
    cue: 'Tap a filter.',
    replays: false,
    Demo: Demo17,
  },
  {
    slug: 'morphing-status-badge',
    name: 'Morphing Status Badge',
    purpose: 'Changes one badge between ready, saving, saved and failed.',
    category: 'status',
    cue: 'Tap Save to run through the statuses.',
    replays: false,
    Demo: Demo18,
  },
  {
    slug: 'progress-ring',
    name: 'Progress Ring',
    purpose: 'Animates a ring to a chosen percentage.',
    category: 'status',
    cue: 'Drag the slider, or use the arrow keys on it.',
    replays: true,
    Demo: Demo19,
  },
  {
    slug: 'skeleton-sweep',
    name: 'Skeleton Sweep',
    purpose: 'Cross-fades shimmering placeholders into loaded content.',
    category: 'status',
    cue: 'Loads on entry. Tap Load again to repeat.',
    replays: true,
    Demo: Demo20,
  },
  {
    slug: 'toast-stack',
    name: 'Toast Stack',
    purpose: 'Stacks notices that enter, wait and dismiss.',
    category: 'status',
    cue: 'Tap Send a notice a few times.',
    replays: false,
    Demo: Demo21,
  },
  {
    slug: 'animated-stepper',
    name: 'Animated Stepper',
    purpose: 'Fills a progress line as the user moves between steps.',
    category: 'status',
    cue: 'Tap Next and Back, or pick a step.',
    replays: false,
    Demo: Demo22,
  },
  {
    slug: 'scroll-reveal',
    name: 'Scroll Reveal',
    purpose: 'Reveals items as they scroll into view inside a container.',
    category: 'status',
    cue: 'Scroll inside the box. It also takes focus for arrow keys.',
    replays: true,
    Demo: Demo23,
  },
];
