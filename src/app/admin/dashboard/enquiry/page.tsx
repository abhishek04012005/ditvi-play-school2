'use client';
import EnquiryDashboard from "@/admin/dashboard/enquiry/enquiry";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";

export default function enquiryPage() {
    const router = useRouter();
    const { isAuthenticated, adminRoleId, loading } = useAdminAuth();

    // Tele-caller (role_id = 2) cannot access enquiry dashboard; redirect them
    if (!loading && isAuthenticated && adminRoleId === 2) {
        router.push('/admin/dashboard/admission');
        return null;
    }

    // Show loader or wait for auth check to complete
    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    // If not authenticated, useAdminAuth will handle redirect; don't render
    if (!isAuthenticated) {
        return null;
    }

    return <EnquiryDashboard />;
}