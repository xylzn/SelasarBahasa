import TugasForm from '@/components/admin/forms/TugasForm';

export default function CreateTugasPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tambah Tugas Baru</h1>
      </div>
      <TugasForm />
    </div>
  );
}
