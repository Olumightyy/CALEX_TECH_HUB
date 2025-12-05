import Link from "next/link"
import { Star, Users, Clock, BookOpen } from "lucide-react"
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
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={
            course.thumbnail_url || `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(course.title)}`
          }
          alt={course.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {course.is_featured && <Badge className="absolute left-3 top-3 bg-gold-500 text-navy-900">Featured</Badge>}
        {course.price === 0 && <Badge className="absolute right-3 top-3 bg-green-500 text-white">Free</Badge>}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Level */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {course.category && (
            <Badge variant="secondary" className="text-xs">
              {course.category.name}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {course.level}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-semibold group-hover:text-primary">{course.title}</h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {course.short_description || course.description}
        </p>

        {/* Progress Bar (if enrolled) */}
        {showProgress && progress !== undefined && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.total_duration)}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.total_lessons} lessons
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.enrollment_count}
          </div>
        </div>

        {/* Teacher */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 overflow-hidden rounded-full bg-muted">
              <img
                src={course.teacher?.avatar_url || `/placeholder.svg?height=28&width=28&query=avatar`}
                alt={course.teacher?.full_name || "Instructor"}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs text-muted-foreground">{course.teacher?.full_name || "Instructor"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
            <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({course.review_count})</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 border-t border-border pt-4">
          <span className="text-xl font-bold text-primary">
            {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
          </span>
        </div>
      </div>
    </Link>
  )
}
