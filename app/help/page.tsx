import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, BookOpen, MessageCircle, Mail, Phone, FileText, HelpCircle, Video, Users } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer:
        "Browse our course catalog, select a course you're interested in, and click the 'Enroll' button. If it's a paid course, you'll be guided through the payment process. Once enrolled, the course will appear in your dashboard.",
    },
    {
      question: "Can I get a refund if I'm not satisfied with a course?",
      answer:
        "Yes, we offer a 30-day money-back guarantee on all paid courses. If you're not satisfied, contact our support team within 30 days of purchase for a full refund.",
    },
    {
      question: "How do I become a teacher on this platform?",
      answer:
        "Click on 'Become a Teacher' in the navigation menu or sign up with a teacher account. Submit your credentials and teaching experience for verification. Once approved, you can start creating and publishing courses.",
    },
    {
      question: "Will I receive a certificate after completing a course?",
      answer:
        "Yes, you'll receive a certificate of completion for each course you finish. Certificates include your name, course title, completion date, and can be downloaded or shared on LinkedIn.",
    },
    {
      question: "How do I track my learning progress?",
      answer:
        "Your dashboard shows your progress for each enrolled course. You can see completed lessons, quiz scores, and overall completion percentage. Each course page also displays your progress.",
    },
    {
      question: "Can I access courses on mobile devices?",
      answer:
        "Yes, our platform is fully responsive and works on all devices including smartphones and tablets. You can learn anywhere, anytime.",
    },
    {
      question: "How do teachers get paid?",
      answer:
        "This is a centralized platform where all payments go to the school owner. Teachers are content creators and do not receive direct payments through the platform. Payment arrangements are handled separately by the platform administrator.",
    },
    {
      question: "What video formats are supported?",
      answer:
        "We support MP4, WebM, and other common video formats. For best quality, we recommend uploading videos in 1080p resolution with H.264 encoding.",
    },
  ]

  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using the platform",
      link: "#getting-started",
    },
    {
      icon: Video,
      title: "Course Content",
      description: "Understanding lessons and materials",
      link: "#course-content",
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Manage your profile and settings",
      link: "#account",
    },
    {
      icon: FileText,
      title: "Certificates",
      description: "Learn about course certificates",
      link: "#certificates",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
              <p className="mt-1 text-muted-foreground">Find answers and get support</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search */}
        <Card className="border-0 shadow-lg mb-12">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 rounded-full bg-primary/10">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">How can we help you?</h2>
              <p className="text-muted-foreground mb-6">Search our knowledge base for answers</p>
              <div className="relative w-full max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for help articles..."
                  className="h-14 pl-12 pr-4 text-lg rounded-xl border-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Categories */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {helpCategories.map((category) => (
            <Link key={category.title} href={category.link}>
              <Card className="border-0 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="mb-4 p-3 rounded-xl bg-primary/10 w-fit">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQs */}
        <Card className="border-0 shadow-sm mb-12">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
              <p className="text-muted-foreground mb-6">Our support team is here to assist you</p>
              <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-3">Get help via email</p>
                    <Button variant="outline" size="sm">
                      support@eduplatform.com
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Live Chat</h3>
                    <p className="text-sm text-muted-foreground mb-3">Chat with our team</p>
                    <Button size="sm">Start Chat</Button>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Phone Support</h3>
                    <p className="text-sm text-muted-foreground mb-3">Call us directly</p>
                    <Button variant="outline" size="sm">
                      1-800-EDU-HELP
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
