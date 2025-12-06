import CreateUser from '@/admin/createuser/createuser';

export const metadata = {
  title: 'Create User - Admin',
  description: 'Create a new admin user'
};

export default function CreateUserPage() {
  return <CreateUser />;
}
