import { BookOpen, Award, Users, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Materi Lengkap',
    description: 'Berbagai materi bahasa mulai dari dasar hingga mahir dengan teks dan video.',
  },
  {
    icon: Award,
    title: 'Sertifikat',
    description: 'Dapatkan sertifikat setelah menyelesaikan setiap level pembelajaran.',
  },
  {
    icon: Users,
    title: 'Komunitas',
    description: 'Bergabung dengan komunitas belajar yang mendukung dan aktif.',
  },
  {
    icon: CheckCircle,
    title: 'Quiz Interaktif',
    description: 'Uji pemahamanmu dengan quiz yang bervariasi dan feedback langsung.',
  },
];

export default function AboutSection() {
  return (
    <section className="py-20" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mengapa Memilih SelasarBahasa?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan pengalaman belajar bahasa terbaik dengan pendekatan modern dan efektif.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
