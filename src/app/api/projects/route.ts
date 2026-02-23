import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, artistName } = body

        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: { id: user.id, email: user.email || undefined },
        })

        const project = await prisma.project.create({
            data: {
                title,
                artistName,
                userId: user.id,
                status: 'ARRANGEMENT',
                progress: { lyrics: 0, arrangement: 0, mix: 0 },
                musicalMetadata: {
                    create: {
                        bpmMap: [{ value: 120, bar: 1 }],
                        keyMap: [{ value: "C", bar: 1 }],
                        timeSignature: [{ value: "4/4", bar: 1 }],
                        referenceTracks: []
                    }
                }
            },
        })

        return NextResponse.json(project)
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}
