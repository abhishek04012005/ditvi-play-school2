import GoogleDriveUploadForm from '@/components/googledriveupload/googledriveupload';

export const metadata = {
  title: 'Google Drive Upload - Prototype',
  description: 'Upload photos to Google Drive using OAuth2.0',
};

export default function GoogleDriveUploadPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <GoogleDriveUploadForm />
    </main>
  );
}
