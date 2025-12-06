'use client';
import { useEffect } from 'react';
import EnquiryDashboard from "@/admin/dashboard/enquiry/enquiry";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";

export default function enquiryPage() {
    const router = useRouter();
    const { isAuthenticated, adminRoleId, loading } = useAdminAuth();

    // Move router.push into useEffect to avoid render-time state updates
    useEffect(() => {
        if (!loading && isAuthenticated && adminRoleId === 2) {
            router.push('/admin/dashboard/admission');
        }
    }, [loading, isAuthenticated, adminRoleId, router]);

    // Show loader or wait for auth check to complete
    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    // If not authenticated, useAdminAuth will handle redirect; don't render
    if (!isAuthenticated) {
        return null;
    }

    // If tele-caller (role_id = 2), don't render (redirect happens in useEffect)
    if (adminRoleId === 2) {
        return null;
    }

    return <EnquiryDashboard />;
}