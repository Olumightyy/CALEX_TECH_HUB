import Link from "next/link"
import { Star, Users, Clock, BookOpen, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Course, Profile, Category } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface CourseWithRelations extends Course {
  teacher?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
  category?: Pick<Category, "id" | "name" | "slug"> | null
}

interface CourseCardProps {
  course: CourseWithRelations
  showProgress?: boolean
  progress?: number
  variant?: "default" | "compact" | "horizontal"
}

export function CourseCard({ course, showProgress, progress, variant = "default" }: CourseCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={`/courses/${course.slug}`}
        className="group flex overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
      >
        {/* Thumbnail */}
        <div className="relative h-36 w-48 flex-shrink-0 overflow-hidden bg-muted">
          <img
            src={
              course.thumbnail_url || `/placeholder.svg?height=144&width=192&query=${encodeURIComponent(course.title)}`
            }
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Play className="ml-0.5 h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            <Clock className="h-3 w-3" />
            {formatDuration(course.total_duration)}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {course.category && (
                <Badge variant="secondary" className="rounded-md text-xs">
                  {course.category.name}
                </Badge>
              )}
              <Badge variant="outline" className="rounded-md text-xs capitalize">
                {course.level}
              </Badge>
            </div>
            <h3 className="mb-1 line-clamp-1 font-semibold text-foreground group-hover:text-primary">{course.title}</h3>
            <p className="line-clamp-1 text-sm text-muted-foreground">{course.teacher?.full_name || "Instructor"}</p>
          </div>

          {showProgress && progress !== undefined ? (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({course.review_count})</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
              </span>
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-xl card-hover",
        variant === "compact" && "rounded-lg",
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={
            course.thumbnail_url || `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(course.title)}`
          }
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {course.is_featured && <Badge className="bg-accent text-accent-foreground shadow-sm">Featured</Badge>}
          {course.price === 0 && <Badge className="bg-emerald-500 text-white shadow-sm">Free</Badge>}
        </div>

        {/* Duration */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Clock className="h-3 w-3" />
          {formatDuration(course.total_duration)}
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-xl transition-transform group-hover:scale-110">
            <Play className="ml-1 h-7 w-7 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex flex-1 flex-col p-5", variant === "compact" && "p-4")}>
        {/* Category & Level */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {course.category && (
            <Badge variant="secondary" className="rounded-md text-xs">
              {course.category.name}
            </Badge>
          )}
          <Badge variant="outline" className="rounded-md text-xs capitalize">
            {course.level}
          </Badge>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary",
            variant === "compact" ? "text-base" : "text-lg",
          )}
        >
          {course.title}
        </h3>

        {/* Description */}
        {variant !== "compact" && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {course.short_description || course.description}
          </p>
        )}

        {/* Progress Bar (if enrolled) */}
        {showProgress && progress !== undefined && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course.total_lessons} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{course.enrollment_count.toLocaleString()}</span>
          </div>
        </div>

        {/* Teacher & Rating */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-muted ring-2 ring-background">
              <img
                src={course.teacher?.avatar_url || `/placeholder.svg?height=32&width=32&query=avatar`}
                alt={course.teacher?.full_name || "Instructor"}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm text-muted-foreground">{course.teacher?.full_name || "Instructor"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">{course.average_rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-2xl font-bold text-primary">
            {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
          </span>
          {course.price > 0 && course.original_price && course.original_price > course.price && (
            <span className="text-sm text-muted-foreground line-through">
              ₦{course.original_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
