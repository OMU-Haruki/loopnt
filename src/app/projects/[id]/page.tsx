import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import ProjectHeader from '@/components/project/ProjectHeader'
import AudioPlayer from '@/components/project/AudioPlayer'
import InfoPanel from '@/components/project/InfoPanel'
import StructureBuilder from '@/components/project/StructureBuilder'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let project = null

    if (!id.startsWith('local_')) {
        if (!user) return notFound()

        project = await prisma.project.findUnique({
            where: { id: id, userId: user.id },
            include: {
                musicalMetadata: true,
                songStructures: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        })

        if (!project) return notFound()
    }

    // If local, the client components will fetch from Zustand store.
    const isLocal = id.startsWith('local_')

    return (
        <div className="w-full max-w-6xl p-6 flex flex-col gap-6">
            <ProjectHeader project={project} isLocal={isLocal} projectId={id} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <AudioPlayer project={project} isLocal={isLocal} projectId={id} />
                    <InfoPanel project={project} isLocal={isLocal} projectId={id} />
                </div>

                <div className="lg:col-span-1">
                    <StructureBuilder project={project} isLocal={isLocal} projectId={id} />
                </div>
            </div>
        </div>
    )
}
