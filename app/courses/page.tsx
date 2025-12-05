import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CourseCard } from "@/components/courses/course-card"
import { Search, Filter, SlidersHorizontal } from "lucide-react"

interface SearchParams {
  category?: string
  level?: string
  search?: string
  sort?: string
  page?: string
}

async function getCourses(params: SearchParams) {
  const supabase = await createClient()

  let query = supabase
    .from("courses")
    .select(`
      *,
      teacher:profiles!teacher_id(id, full_name, avatar_url),
      category:categories(id, name, slug)
    `)
    .eq("status", "published")

  if (params.category) {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", params.category).single()

    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.level && params.level !== "all") {
    query = query.eq("level", params.level)
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  switch (params.sort) {
    case "newest":
      query = query.order("published_at", { ascending: false })
      break
    case "popular":
      query = query.order("enrollment_count", { ascending: false })
      break
    case "rating":
      query = query.order("average_rating", { ascending: false })
      break
    case "price-low":
      query = query.order("price", { ascending: true })
      break
    case "price-high":
      query = query.order("price", { ascending: false })
      break
    default:
      query = query.order("is_featured", { ascending: false }).order("enrollment_count", { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching courses:", error)
    return []
  }

  return data || []
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from("categories").select("*").order("name")
  return data || []
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [courses, categories] = await Promise.all([getCourses(params), getCategories()])

  const selectedCategory = categories.find((c) => c.slug === params.category)

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      {/* Header */}
      <section className="border-b border-border bg-card px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold sm:text-4xl">{selectedCategory ? selectedCategory.name : "All Courses"}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {selectedCategory ? selectedCategory.description : "Discover courses taught by verified experts"}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-background px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <form className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                placeholder="Search courses..."
                defaultValue={params.search}
                className="pl-10"
              />
            </div>
            <Select name="category" defaultValue={params.category || "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="level" defaultValue={params.level || "all"}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select name="sort" defaultValue={params.sort || "featured"}>
              <SelectTrigger className="w-[160px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Filter className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </form>
        </div>
      </section>

      {/* Course Grid */}
      <section className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No courses found</h3>
              <p className="mb-6 text-muted-foreground">Try adjusting your filters or search terms</p>
              <Button asChild variant="outline">
                <Link href="/courses">Clear Filters</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                Showing {courses.length} course{courses.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
