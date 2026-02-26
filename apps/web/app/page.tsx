import dynamic from 'next/dynamic';

const LivingTableLab = dynamic(() => import('../components/living-table-lab'), { ssr: false });

export default function HomePage() {
  return <LivingTableLab />;
}
