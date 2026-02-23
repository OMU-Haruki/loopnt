'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Check, X } from 'lucide-react'

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

export default function ProjectHeader({ project, isLocal, projectId }: { project: any, isLocal: boolean, projectId?: string }) {
    const router = useRouter()
    const localProjects = useStore((state) => state.localProjects)
    const updateLocalProject = useStore((state) => state.updateLocalProject)
    const deleteLocalProject = useStore((state) => state.deleteLocalProject)

    const localProject = localProjects.find(p => p.id === projectId)
    const current = isLocal ? localProject : project

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(current?.title || '')
    const [editArtist, setEditArtist] = useState(current?.artistName || '')
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted || !current) return null

    const handleStatusChange = async (newStatus: string) => {
        if (isLocal && projectId) {
            updateLocalProject(projectId, { status: newStatus })
            return
        }
        // API logic to update project status in DB
        await fetch(`/api/projects/${current.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        })
        router.refresh()
    }

    const handleSaveEdit = async () => {
        if (!editTitle.trim()) return

        if (isLocal && projectId) {
            updateLocalProject(projectId, { title: editTitle, artistName: editArtist })
            setIsEditing(false)
            return
        }

        // API update
        await fetch(`/api/projects/${current.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editTitle, artistName: editArtist })
        })
        router.refresh()
        setIsEditing(false)
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return

        if (isLocal && projectId) {
            deleteLocalProject(projectId)
            router.push('/')
            return
        }

        // API delete
        await fetch(`/api/projects/${current.id}`, { method: 'DELETE' })
        router.push('/')
    }

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-6">
                <div className="flex flex-col gap-4">
                    {/* Top Row: Title & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 w-full min-w-0">
                            {isEditing ? (
                                <div className="flex items-center gap-2 w-full mb-2">
                                    <Input
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        className="text-xl sm:text-2xl font-bold h-10 w-full"
                                    />
                                    <Button size="icon" variant="ghost" className="shrink-0" onClick={handleSaveEdit}>
                                        <Check className="h-5 w-5 text-green-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="shrink-0" onClick={() => { setIsEditing(false); setEditTitle(current.title); setEditArtist(current.artistName || '') }}>
                                        <X className="h-5 w-5 text-destructive" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-2 mb-1 w-full relative">
                                    <CardTitle className="text-2xl sm:text-3xl font-bold break-all sm:break-words min-w-0 max-w-full overflow-hidden">{current.title}</CardTitle>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={() => setIsEditing(true)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    {isLocal && <Badge variant="secondary" className="whitespace-nowrap shrink-0">Guest Mode</Badge>}
                                </div>
                            )}

                            {isEditing ? (
                                <Input
                                    value={editArtist}
                                    onChange={e => setEditArtist(e.target.value)}
                                    placeholder="Artist Name"
                                    className="w-full sm:w-64 h-8 mt-1"
                                />
                            ) : (
                                <CardDescription className="text-base sm:text-lg break-all sm:break-words min-w-0 max-w-full overflow-hidden">
                                    {current.artistName || 'Unknown Artist'}
                                </CardDescription>
                            )}
                        </div>

                        {/* Status Select & Delete */}
                        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                            <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-md border">
                                <Select defaultValue={current.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-[140px] h-8 border-none bg-transparent shadow-none focus:ring-0">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ARRANGEMENT">Arrangement</SelectItem>
                                        <SelectItem value="MIXING">Mixing</SelectItem>
                                        <SelectItem value="MASTERING">Mastering</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="SCRAPED">Scrapped</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="w-px h-5 bg-border mx-1" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                                    onClick={handleDelete}
                                    title="Delete Project"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-col sm:items-end text-[11px] text-muted-foreground px-1">
                                <span>Created: {formatDate(current.createdAt)}</span>
                                <span>Updated: {formatDateTime(current.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
        </Card>
    )
}
