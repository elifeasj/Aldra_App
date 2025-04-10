export interface Guide {
  id: number;
  title: string;
  image: string;
  category: string;
  tags: string[];
  relation: string;
  help_tags: string[];
  visible: boolean;
  content?: string;
}

export interface UserProfileAnswers {
  id: string;
  user_id: number;
  relation_to_person: string;
  diagnosed_dementia_type: string;
  experience_level: string;
  main_challenges: string[];
  help_needs: string[];
  completed_at: string;
}
