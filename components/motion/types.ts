export type MotionCategory =
  | 'text'
  | 'cards'
  | 'buttons'
  | 'navigation'
  | 'layout'
  | 'status'
  | 'scroll'
  | 'data'
  | 'inputs'
  | 'ambient'
  | 'patterns';

export interface CatalogEntry {
  /** Folder name, file name and page anchor. Never change a shipped slug. */
  slug: string;
  name: string;
  category: MotionCategory;
  /** Extra words people might search for. */
  keywords: string[];
  /** One line on what it is for. */
  purpose: string;
  /** How to trigger the demo. */
  cue: string;
  /** True when the demo plays on entry, so "Replay" is the natural control. */
  replays: boolean;
}

export interface MotionFile {
  name: string;
  kind: 'component' | 'css' | 'helper';
  code: string;
}

export interface MotionSource {
  /** The usage example. It is the file the Preview tab renders. */
  usage: string;
  /** Component first, then its CSS, then any helpers it imports. */
  files: MotionFile[];
}
