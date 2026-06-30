export const CACHE_KEYS = {
  materiList: (page: number, isPremium: boolean) => `materi:list:page:${page}:premium:${isPremium}`,
  materiDetail: (slug: string) => `materi:detail:${slug}`,
  quizList: (page: number, isPremium: boolean) => `quiz:list:page:${page}:premium:${isPremium}`,
  quizDetail: (id: string) => `quiz:detail:${id}`,
  packageList: () => `package:list`,
  adminStats: () => `admin:stats`,
  tugasList: (page: number, isPremium: boolean, kelas?: string) => `tugas:list:page:${page}:premium:${isPremium}:kelas:${kelas || 'all'}`,
  tugasDetail: (slug: string) => `tugas:detail:${slug}`,
};
