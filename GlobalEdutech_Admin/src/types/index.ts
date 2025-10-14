// Types for Admin Panel
export interface User {
  _id: string;
  name: string;
  email: string;
  contact_no: string;
  gender: string;
  education: string;
  course: string;
  provider: string;
  firebase_uid?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
  updated_at: string;
}

export interface UsersResponse {
  users: User[];
}

export interface AuthResponse {
  message: string;
  user_id: string;
  token: string;
  user: User;
}

export interface DashboardStats {
  total_users: number;
  total_courses: number;
  total_tests: number;
  total_materials: number;
  total_enrollments: number;
  timestamp: string;
}

export interface RecentActivity {
  recent_users: User[];
  recent_enrollments: any[];
  recent_test_attempts: any[];
}

// Domain Models
export interface Institution {
  _id: string;
  name: string;
  description: string;
  vision?: string;
  mission?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  _id: string;
  title: string;
  description: string;
  student_name: string;
  course: string;
  rating: number;
  media_type: string;
  media_url: string;
  student_image?: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  _id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  start_date: string;
  end_date: string;
  duration: string;
  instructor: string;
  price: number;
  thumbnail_image: string;
  enrolled_students: number;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  _id: string;
  class_name: string;
  course: string;
  sub_category: string;
  module: string;
  title: string;
  description: string;
  academic_year: string;
  time_period: number;
  price: number;
  file_url: string;
  file_size?: number;
  sample_images: string[];
  download_count: number;
  tags: string[];
  feedback: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestItem {
  _id: string;
  class_name: string;
  course: string;
  sub_category?: string;
  subject: string;
  module: string;
  test_title: string;
  description: string;
  total_questions: number;
  total_marks: number;
  duration: number;
  difficulty_level: string;
  pass_mark: number;
  validity_days: number;
  price: number;
  date_published: string;
  result_type: string;
  answer_key: boolean;
  tags: string[];
  attempts_count: number;
  feedback: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestQuestion {
  _id: string;
  test_id: string;
  question_number: number;
  question: string;
  options: Array<{
    label: string;
    text: string;
  }>;
  correct_answer: string;
  explanation?: string;
  marks: number;
  image_url?: string;
  description_images?: string[];
  difficulty_level: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  target_audience: string;
  priority: string;
  is_active: boolean;
  read_by: string[];
  created_at: string;
  updated_at: string;
}

export interface CurrentAffairsItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  publish_date: string;
  tags: string[];
  view_count: number;
  likes: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentItem {
  _id: string;
  user_id: string;
  course_id: string;
  enrollment_date: string;
  status: string;
  progress: number;
  payment_status: string;
  amount_paid: number;
  certificate_issued: boolean;
  created_at: string;
  updated_at: string;
}

export interface TermsItem {
  _id: string;
  content?: string;
  effective_date: string;
  last_modified: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactItem {
  _id: string;
  company_name?: string;
  address?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  working_hours?: string;
  emergency_contact?: string;
  social_media?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageItem {
  _id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}