import type { Metadata } from 'next';
import './layerwake.css';

export const metadata: Metadata = {
  title: 'Layerwake — See how interfaces are built. Make them your own.',
  description:
    'Capture one UI component, inspect its spacing, type and color decisions, rebuild your own variant and export design tokens and starter code.',
};

export default function LayerwakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='lw-app'>{children}</div>;
}
