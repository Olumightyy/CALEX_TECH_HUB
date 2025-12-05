import Link from "next/link"
import { Star, Users, Clock, BookOpen, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Course, Profile, Category } from "@/lib/types/database"

interface CourseWithRelations extends Course {
  teacher?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
  category?: Pick<Category, "id" | "name" | "slug"> | null
}

interface CourseCardProps {
  course: CourseWithRelations
  showProgress?: boolean
  progress?: number
}

export function CourseCard({ course, showProgress, progress }: CourseCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
        ) : (
             <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                <BookOpen className="h-12 w-12 opacity-20" />
             </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
             <div className="rounded-full bg-white/20 p-3 text-white backdrop-blur-md border border-white/30 transform scale-90 transition-transform duration-300 group-hover:scale-100">
                <Play className="h-6 w-6 fill-white" />
             </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {course.is_featured && (
                <Badge className="bg-amber-500 text-slate-900 hover:bg-amber-600 border-none shadow-sm">Featured</Badge>
            )}
        </div>
        
        {course.price === 0 && (
            <Badge className="absolute right-3 top-3 bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-sm">Free</Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category & Level */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {course.category && (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100 text-xs font-normal">
              {course.category.name}
            </Badge>
          )}
          <Badge variant="outline" className="border-slate-200 text-slate-500 text-xs font-normal capitalize">
            {course.level}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
            {course.title}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">
          {course.short_description || course.description}
        </p>

        {/* Progress Bar (if enrolled) */}
        {showProgress && progress !== undefined && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Progress</span>
              <span className="font-bold text-slate-900">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-5 flex items-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.total_duration)}
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {course.total_lessons} lessons
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {course.enrollment_count}
          </div>
        </div>

        {/* Teacher & Rating */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                {course.teacher?.avatar_url ? (
                  <img
                    src={course.teacher.avatar_url}
                    alt={course.teacher.full_name || "Instructor"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[10px] font-bold text-slate-400">
                        {course.teacher?.full_name?.charAt(0) || "T"}
                    </div>
                )}
            </div>
            <span className="text-sm font-medium text-slate-700">{course.teacher?.full_name || "Instructor"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-slate-900">{course.average_rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Price (Only show if NOT showing progress, i.e., likely not enrolled view) */}
        {!showProgress && (
             <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                     <span className="text-xs text-slate-500 block">Price</span>
                     <span className="text-lg font-bold text-slate-900">
                        {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                     </span>
                </div>
            </div>
        )}
      </div>
    </Link>
  )
}
