/**
 * Generic stand-in copy. Captures never contain page text, only its length,
 * so reconstructed text slots are filled with neutral words of similar length.
 */

const SHORT = [
  'Tag',
  'New',
  'Text',
  'Item',
  'Note',
  'Label',
  'Title',
  'Value',
  'Button',
  'Action',
  'Heading',
  'Caption',
  'Subtitle',
  'Category',
  'Item name',
  'Short text',
  'Label text',
  'Short label',
  'Card heading',
  'Button label',
];

const SENTENCE =
  'Placeholder copy that keeps the same rough length as the measured text so the spacing stays honest while you adapt this layer and make it your own';

export function placeholderText(length: number, seed = 0): string {
  const target = Math.max(1, Math.min(Math.floor(length) || 0, 2000));

  if (target <= 12) {
    // Closest stock phrase that is no longer than the original.
    const fits = SHORT.filter((word) => word.length <= target);
    const pool = fits.length ? fits : [SHORT[0]];
    const best = Math.max(...pool.map((word) => word.length));
    const closest = pool.filter((word) => word.length >= best - 1);
    return closest[seed % closest.length];
  }

  const words = SENTENCE.split(' ');
  const out: string[] = [];
  let total = 0;
  for (let i = 0; ; i++) {
    const word = words[i % words.length];
    const next = total + word.length + (out.length ? 1 : 0);
    if (out.length > 0 && next > target) break;
    out.push(
      i >= words.length && i % words.length === 0 ? word : word.toLowerCase()
    );
    total = next;
  }
  out[0] = out[0].charAt(0).toUpperCase() + out[0].slice(1);
  return out.join(' ');
}
