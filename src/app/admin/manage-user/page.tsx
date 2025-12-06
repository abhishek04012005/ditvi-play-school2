import ManageUser from '@/admin/manageuser/manageuser';

export const metadata = {
  title: 'Manage Users - Admin',
  description: 'Manage admin users, reset passwords, and control access'
};

export default function ManageUserPage() {
  return <ManageUser />;
}
