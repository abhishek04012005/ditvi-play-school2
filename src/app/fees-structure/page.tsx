import { Suspense } from 'react';
import FeesPageTemplate from '@/components/brochure/feesPageTemplate';

export const metadata = {
  title: 'Fee Structure - Ditvi Play School',
  description: 'View our transparent and flexible fee structure for all programs',
};

function FeesStructureContent() {
  return <FeesPageTemplate />;
}

export default function FeesStructurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeesStructureContent />
    </Suspense>
  );
}
