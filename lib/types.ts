export interface Scholarship {
  id?: string;
  title: string;
  country: string;
  organization: string;
  category: string;
  deadline: string;
  link: string;
  description: string;
  requirements: string[]; // Энэ чухал
  checklist: string[];    // Энэ чухал
}