'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useStore } from '@/store/useStore'
import { createClient } from '@/utils/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


const formSchema = z.object({
    title: z.string().optional(),
    artistName: z.string().optional(),
})

export default function NewProjectPage() {
    const router = useRouter()
    const addLocalProject = useStore((state) => state.addLocalProject)
    const [loading, setLoading] = useState(false)
    const [isGuest, setIsGuest] = useState(false)

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            artistName: '',
        },
    })

    // Check auth
    useEffect(() => {
        const sb = createClient()
        sb.auth.getUser().then(({ data }) => {
            if (!data.user) {
                setIsGuest(true)
            } else if (data.user.user_metadata?.username) {
                setValue('artistName', data.user.user_metadata.username)
            }
        })
    }, [setValue])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        const finalTitle = values.title?.trim() || 'Untitled Track'
        const submitData = { ...values, title: finalTitle }

        if (isGuest) {
            // Save locally via Zustand
            const now = new Date().toISOString()
            const newLocalId = `local_${Date.now()}`
            addLocalProject({
                id: newLocalId,
                ...submitData,
                status: 'ARRANGEMENT',
                createdAt: now,
                updatedAt: now,
                progress: { lyrics: 0, arrangement: 0, mix: 0 },
                musicalMetadata: {
                    bpmMap: [{ value: 120, bar: 1 }],
                    keyMap: [{ value: "C", bar: 1 }],
                    timeSignature: [{ value: "4/4", bar: 1 }],
                    referenceTracks: []
                },
                songStructure: []
            })
            router.push(`/projects/${newLocalId}`)
            return
        }

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            })

            if (res.ok) {
                const data = await res.json()
                router.push(`/projects/${data.id}`)
            } else {
                console.error('Failed to create project')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl px-6 py-10 mt-10 border rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
            {isGuest && (
                <div className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/50 p-4 rounded-md mb-6">
                    <p className="font-semibold text-sm">You are creating this project in Guest Mode.</p>
                    <p className="text-sm">It will be saved locally on your browser. To sync across devices, please log in.</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Project Title (Song Name)</Label>
                    <Input id="title" {...register('title')} placeholder="Untitled Track" />
                    {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="artistName">Artist Name</Label>
                    <Input id="artistName" {...register('artistName')} placeholder="e.g. John Doe" />
                </div>



                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
