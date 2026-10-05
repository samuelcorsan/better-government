import type { Metadata } from 'next';
import Harness from '../../../../proto/sol/harness';

export const metadata: Metadata = {
  title: 'Prototipo · Reforma Digital Sol',
  robots: { index: false, follow: false },
};

export default async function ProtoSolPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // El servidor pinta ya la variante pedida en ?v=, sin esperar a la hidratación.
  const { v } = await searchParams;
  return <Harness inicial={Number(v) - 1} />;
}
