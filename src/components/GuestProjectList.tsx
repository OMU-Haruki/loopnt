'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

export default function GuestProjectList() {
    const localProjects = useStore((state) => state.localProjects)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className="text-center py-20 text-muted-foreground opacity-50">Loading local projects...</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localProjects.length === 0 ? (
                <div className="col-span-full text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">You are in Guest Mode. Local projects appear here.</p>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        (They are saved locally in your browser to test it out.)
                    </p>
                    <Link href="/new">
                        <Button variant="outline">
                            Create your first project
                        </Button>
                    </Link>
                </div>
            ) : (
                localProjects.map((proj) => (
                    <Link key={proj.id} href={`/projects/${proj.id}`}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer active:scale-[0.98] h-full flex flex-col">
                            <CardHeader className="pb-4 overflow-hidden flex-1">
                                <CardTitle className="text-xl truncate" title={proj.title}>{proj.title}</CardTitle>
                                <CardDescription className="truncate" title={proj.artistName || 'Unknown Artist'}>{proj.artistName || 'Unknown Artist'}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                                <div className="flex flex-col gap-3 mt-4">
                                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                                        <span>Created: {formatDate(proj.createdAt)}</span>
                                        <span>Updated: {formatDateTime(proj.updatedAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${getStatusColor(proj.status)}`}>
                                            {proj.status.charAt(0) + proj.status.slice(1).toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))
            )}
        </div>
    )
}
