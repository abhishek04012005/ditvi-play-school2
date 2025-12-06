'use client';
import { useEffect } from 'react';
import Spotlight from "@/admin/spotlight/spotlight";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";

export default function SpotlightPage() {
    const router = useRouter();
    const { isAuthenticated, adminRoleId, loading } = useAdminAuth();

    // Tele-caller (role_id = 2) cannot access spotlight dashboard; redirect them
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

    // Don't render while redirecting role_id = 2
    if (adminRoleId === 2) {
        return null;
    }

    return <Spotlight />;
}