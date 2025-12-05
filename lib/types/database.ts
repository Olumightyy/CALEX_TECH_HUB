export type UserRole = "student" | "teacher" | "admin"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  phone: string | null
  bio: string | null
  is_verified: boolean
  verification_status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Course {
  id: string
  teacher_id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  preview_video_url: string | null
  price: number
  level: "beginner" | "intermediate" | "advanced"
  language: string
  status: "draft" | "pending_review" | "approved" | "rejected" | "published"
  rejection_reason: string | null
  is_featured: boolean
  total_duration: number
  total_lessons: number
  enrollment_count: number
  average_rating: number
  review_count: number
  tags: string[] | null
  requirements: string[] | null
  objectives: string[] | null
  created_at: string
  updated_at: string
  published_at: string | null
  // Joined fields
  teacher?: Profile
  category?: Category
  modules?: Module[]
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string | null
  position: number
  created_at: string
  updated_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  course_id: string
  title: string
  description: string | null
  content_type: "video" | "text" | "pdf" | "quiz"
  video_url: string | null
  content: string | null
  pdf_url: string | null
  duration: number
  position: number
  is_preview: boolean
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  lesson_id: string
  course_id: string
  title: string
  description: string | null
  passing_score: number
  time_limit: number | null
  max_attempts: number
  created_at: string
  updated_at: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  question_type: "multiple_choice" | "true_false" | "short_answer"
  options: string[] | null
  correct_answer: string
  explanation: string | null
  points: number
  position: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: string
  answers: Record<string, string>
  score: number
  passed: boolean
  time_taken: number | null
  attempt_number: number
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  status: "active" | "completed" | "expired" | "refunded"
  progress: number
  enrolled_at: string
  completed_at: string | null
  last_accessed_at: string | null
  course?: Course
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  course_id: string
  is_completed: boolean
  watch_time: number
  last_position: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  student_id: string
  course_id: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  payment_method: string | null
  payment_reference: string | null
  gateway: string | null
  gateway_response: Record<string, unknown> | null
  created_at: string
  updated_at: string
  course?: Course
}

export interface Certificate {
  id: string
  student_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  student_name: string
  course_title: string
  teacher_name: string
  pdf_url: string | null
}

export interface TeacherApplication {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  expertise: string
  experience_years: number | null
  qualifications: string | null
  portfolio_url: string | null
  linkedin_url: string | null
  bio: string
  reason: string
  status: "pending" | "approved" | "rejected"
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  documents_url: string[] | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  student_id: string
  course_id: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  updated_at: string
  student?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "course" | "payment" | "certificate"
  is_read: boolean
  link: string | null
  created_at: string
}

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface Announcement {
  id: string
  author_id: string
  course_id: string | null
  title: string
  content: string
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  author?: Profile
}
