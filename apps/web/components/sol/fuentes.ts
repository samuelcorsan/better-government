import { Geist, Geist_Mono } from 'next/font/google';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

// Va en el contenedor de cada página Sol junto a `sol-raiz`.
export const fuentesSol = `${geist.variable} ${geistMono.variable}`;
