import ReceiptDashboard from '@/admin/dashboard/receipt/receipt';

export const metadata = {
    title: 'Receipt Dashboard | Admin',
    description: 'Manage and print fee receipts',
};

export default function Page() {
    return <ReceiptDashboard />;
}
