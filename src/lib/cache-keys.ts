export const CACHE_KEYS = {
  materiList: (page: number, isPremium: boolean) => `materi:list:page:${page}:premium:${isPremium}`,
  materiListByKelas: (kelas: string, isPremium: boolean, tipe?: 'TEKS' | 'VIDEO') => `materi:list:kelas:${kelas}:premium:${isPremium}:tipe:${tipe || 'all'}`,
  materiDetail: (slug: string) => `materi:detail:${slug}`,
  quizList: (page: number, isPremium: boolean) => `quiz:list:page:${page}:premium:${isPremium}`,
  quizDetail: (id: string) => `quiz:detail:${id}`,
  packageList: () => `package:list`,
  adminStats: () => `admin:stats`,
  tugasList: (page: number, isPremium: boolean, kelas?: string) => `tugas:list:page:${page}:premium:${isPremium}:kelas:${kelas || 'all'}`,
  tugasListByKelas: (kelas: string, isPremium: boolean) => `tugas:list:kelas:${kelas}:premium:${isPremium}`,
  tugasDetail: (slug: string) => `tugas:detail:${slug}`,
};
