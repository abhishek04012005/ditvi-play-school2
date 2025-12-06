'use client';
import ChangePassword from '@/admin/changepassword/changepassword';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function ChangePasswordPage() {
  const { isAuthenticated, loading } = useAdminAuth();

  // Show loader or wait for auth check to complete
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // If not authenticated, useAdminAuth will handle redirect; don't render
  if (!isAuthenticated) {
    return null;
  }

  return <ChangePassword />;
}
