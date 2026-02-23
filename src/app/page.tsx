import GuestProjectList from '@/components/GuestProjectList'
import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let projects: any[] = []

  if (user) {
    projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    })
  } else {
    // Guest users will see projects stored locally.
    // For this boilerplate, render a generic CTA for guests if they have no projects in local storage.
  }

  return (
    <div className="w-full max-w-5xl p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all your music productions in one place.</p>
        </div>
        <Link href="/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {!user ? (
        <GuestProjectList />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">You haven&apos;t created any projects yet.</p>
              <Link href="/new">
                <Button variant="outline">
                  Create your first project
                </Button>
              </Link>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ARRANGEMENT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'MIXING': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    case 'MASTERING': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20'
    default: return 'bg-muted text-muted-foreground border-border'
  }
}

const formatDate = (isoString?: string | Date) => {
  if (!isoString) return 'Unknown'
  const d = new Date(isoString)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const formatDateTime = (isoString?: string | Date) => {
  if (!isoString) return 'Unknown'
  const d = new Date(isoString)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function ProjectCard({ project }: { project: any }) {

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer active:scale-[0.98] h-full flex flex-col">
        <CardHeader className="pb-4 overflow-hidden flex-1">
          <CardTitle className="text-xl truncate" title={project.title}>{project.title}</CardTitle>
          <CardDescription className="truncate" title={project.artistName || 'Unknown Artist'}>{project.artistName || 'Unknown Artist'}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col justify-end">
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${getStatusColor(project.status)}`}>
                {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>Created: {formatDate(project.createdAt)}</span>
              <span>Updated: {formatDateTime(project.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


