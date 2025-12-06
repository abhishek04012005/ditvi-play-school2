'use client';
import CreateUser from '@/admin/createuser/createuser';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function CreateUserPage() {
  const { isAuthenticated, adminRoleId, loading } = useAdminAuth(0); // 0 = super-admin only

  // Show loader or wait for auth check to complete
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // If not authenticated or not super-admin, useAdminAuth will handle redirect; don't render
  if (!isAuthenticated || adminRoleId !== 0) {
    return null;
  }

  return <CreateUser />;
}
