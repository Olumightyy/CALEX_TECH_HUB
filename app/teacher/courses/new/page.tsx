import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseForm } from "@/components/teacher/course-form"
import { createClient } from "@/lib/supabase/server"
import { PlusCircle, BookOpen } from "lucide-react"

export default async function CreateCoursePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
           <div className="bg-amber-100 p-2 rounded-lg">
              <PlusCircle className="h-6 w-6 text-amber-600" />
           </div>
           <h1 className="text-3xl font-bold text-slate-900">Create New Course</h1>
        </div>
        <p className="text-slate-500 max-w-2xl">
          Share your expertise with the world. Fill in the details below to get started. You can always save as a draft.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-slate-900 to-amber-500"></div>
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <BookOpen className="h-5 w-5 text-amber-500" />
             Course Details
          </CardTitle>
          <CardDescription className="text-slate-500">
             Basic information, thumbnail, and categorization.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <CourseForm categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  )
}
