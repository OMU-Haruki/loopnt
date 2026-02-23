import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function POST(
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

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Generate a unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${id}-${Date.now()}.${fileExt}`

        // Convert the File to a Buffer for Supabase
        const buffer = await file.arrayBuffer()

        // Upload to Supabase Storage
        const { error } = await supabase.storage
            .from('audio-demos')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (error) {
            throw error
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('audio-demos')
            .getPublicUrl(fileName)

        // Save URL to Prisma project
        const project = await prisma.project.update({
            where: { id: id, userId: user.id },
            data: { demoAudioUrl: publicUrl }
        })

        return NextResponse.json({ url: publicUrl, project })

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

        const project = await prisma.project.findUnique({ where: { id, userId: user.id } })

        if (project?.demoAudioUrl) {
            // Extract filename from URL to delete from storage as well
            const urlParts = project.demoAudioUrl.split('/')
            const fileName = urlParts.pop()
            const userFolder = urlParts.pop()
            if (fileName && userFolder) {
                await supabase.storage.from('audio-demos').remove([`${userFolder}/${fileName}`])
            }
        }

        await prisma.project.update({
            where: { id: id, userId: user.id },
            data: { demoAudioUrl: null }
        })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}
