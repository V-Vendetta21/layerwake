import type { Metadata } from 'next';
import { Workspace } from '@/components/layerwake/workspace';

export const metadata: Metadata = {
  title: 'Workspace — Layerwake',
};

export default function WorkspacePage() {
  return <Workspace />;
}
