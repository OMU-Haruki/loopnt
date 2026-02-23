import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: Record<string, unknown> = await request.json() as Record<string, unknown>

        const updateData: Record<string, unknown> = {}
        if (body.title !== undefined) updateData.title = body.title
        if (body.artistName !== undefined) updateData.artistName = body.artistName
        if (body.status !== undefined) updateData.status = body.status
        if (body.lyrics !== undefined) updateData.lyrics = body.lyrics
        if (body.memo !== undefined) updateData.memo = body.memo

        if (body.musicalMetadata) {
            updateData.musicalMetadata = {
                upsert: {
                    create: body.musicalMetadata,
                    update: body.musicalMetadata
                }
            }
        }

        if (body.songStructures) {
            updateData.songStructures = {
                deleteMany: {},
                create: (body.songStructures as Record<string, unknown>[]).map((s: Record<string, unknown>, i: number) => ({
                    name: s.name as string,
                    orderIndex: i,
                    memo: s.memo as string,
                    lengthBars: s.lengthBars as number
                }))
            }
        }

        const project = await prisma.project.update({
            where: { id: id, userId: user.id },
            data: updateData
        })

        return NextResponse.json(project)
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const project = await prisma.project.findUnique({
            where: { id: id, userId: user.id }
        })

        if (project?.demoAudioUrl) {
            const urlParts = project.demoAudioUrl.split('/')
            const fileName = urlParts.pop()
            const userFolder = urlParts.pop()
            if (fileName && userFolder) {
                await supabase.storage.from('audio-demos').remove([`${userFolder}/${fileName}`])
            }
        }

        await prisma.project.delete({
            where: { id: id, userId: user.id }
        })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}
