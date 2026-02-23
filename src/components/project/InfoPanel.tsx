'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { useStore } from '@/store/useStore'
import { useEffect, useRef } from 'react'

const isValidUrl = (url: string) => {
    if (!url) return false
    try {
        const u = new URL(url.startsWith('http') ? url : `https://${url}`)
        return u.hostname.includes('.')
    } catch {
        return false
    }
}

export default function InfoPanel({ project, isLocal, projectId }: { project: any, isLocal: boolean, projectId?: string }) {
    const localProjects = useStore((state) => state.localProjects)
    const updateLocalProject = useStore((state) => state.updateLocalProject)

    const localProject = localProjects.find(p => p.id === projectId)
    const current = isLocal ? localProject : project

    const [bpmMap, setBpmMap] = useState([{ value: 120, bar: 1 }])
    const [keyMap, setKeyMap] = useState([{ value: "C", bar: 1 }])
    const [timeSignature, setTimeSignature] = useState([{ value: "4/4", bar: 1 }])
    const [referenceTracks, setReferenceTracks] = useState<{ title: string, url: string }[]>([])

    const [lyrics, setLyrics] = useState('')
    const [memo, setMemo] = useState('')

    const [isLoaded, setIsLoaded] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (current && !isLoaded) {
            // Only populate state once the project is found
            if (current.musicalMetadata?.bpmMap) setBpmMap(current.musicalMetadata.bpmMap)
            if (current.musicalMetadata?.keyMap) setKeyMap(current.musicalMetadata.keyMap)
            if (current.musicalMetadata?.timeSignature) setTimeSignature(current.musicalMetadata.timeSignature)
            if (current.musicalMetadata?.referenceTracks) setReferenceTracks(current.musicalMetadata.referenceTracks)

            if (current.lyrics !== undefined) setLyrics(current.lyrics || '')
            if (current.memo !== undefined) setMemo(current.memo || '')

            setIsLoaded(true)
        }
    }, [current, isLoaded])

    const initialMetadata = useRef(current?.musicalMetadata)

    useEffect(() => {
        if (!isLoaded) return // Don't auto-save if initial data hasn't loaded
        if (isLocal && projectId) {
            updateLocalProject(projectId, {
                lyrics,
                memo,
                musicalMetadata: {
                    ...initialMetadata.current,
                    bpmMap,
                    keyMap,
                    timeSignature,
                    referenceTracks
                }
            })
        } else if (!isLocal && current?.id) {
            // API sync for authenticated users
            fetch(`/api/projects/${current.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lyrics,
                    memo,
                    musicalMetadata: {
                        bpmMap,
                        keyMap,
                        timeSignature,
                        referenceTracks
                    }
                })
            }).catch(console.error)
        }
    }, [bpmMap, keyMap, timeSignature, referenceTracks, lyrics, memo, isLocal, projectId, updateLocalProject, isLoaded, current?.id])



    if (!isMounted) {
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 animate-pulse">
            <Card className="h-64"></Card><Card className="h-64"></Card><Card className="md:col-span-2 h-48"></Card>
        </div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Musical Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* BPM */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold">BPM / Tempo</span>
                            <Button variant="ghost" size="icon" onClick={() => setBpmMap([...bpmMap, { value: 120, bar: 1 }])}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {bpmMap.map((b: { bar: number, value: number }, i: number) => (
                            <div key={i} className="flex gap-2 mb-2 items-center">
                                <span className="text-xs text-muted-foreground w-8">Bar</span>
                                <Input type="number" value={b.bar} onChange={(e) => {
                                    const newMap = [...bpmMap]
                                    newMap[i].bar = Number(e.target.value)
                                    setBpmMap(newMap)
                                }} className="w-16 h-8" />
                                <span className="text-xs text-muted-foreground w-8">BPM</span>
                                <Input type="number" value={b.value} onChange={(e) => {
                                    const newMap = [...bpmMap]
                                    newMap[i].value = Number(e.target.value)
                                    setBpmMap(newMap)
                                }} className="flex-1 h-8" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setBpmMap(bpmMap.filter((_, index: number) => index !== i))}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>

                    {/* Key */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold">Key Signatures</span>
                            <Button variant="ghost" size="icon" onClick={() => setKeyMap([...keyMap, { value: 'C', bar: 1 }])}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {keyMap.map((k: { bar: number, value: string }, i: number) => (
                            <div key={i} className="flex gap-2 mb-2 items-center">
                                <span className="text-xs text-muted-foreground w-8">Bar</span>
                                <Input type="number" value={k.bar} onChange={(e) => {
                                    const newMap = [...keyMap]
                                    newMap[i].bar = Number(e.target.value)
                                    setKeyMap(newMap)
                                }} className="w-16 h-8" />
                                <span className="text-xs text-muted-foreground w-8">Key</span>
                                <Input type="text" value={k.value} onChange={(e) => {
                                    const newMap = [...keyMap]
                                    newMap[i].value = e.target.value
                                    setKeyMap(newMap)
                                }} className="flex-1 h-8" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setKeyMap(keyMap.filter((_, index: number) => index !== i))}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>

                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Lyrics & Memo</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <span className="text-sm font-semibold mb-2 block">Lyrics</span>
                        <Textarea
                            className="resize-y h-32"
                            placeholder="Verse 1..."
                            value={lyrics}
                            onChange={e => setLyrics(e.target.value)}
                        />
                    </div>
                    <div>
                        <span className="text-sm font-semibold mb-2 block">General Memo</span>
                        <Textarea
                            className="resize-y h-24"
                            placeholder="Song vibe, references..."
                            value={memo}
                            onChange={e => setMemo(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Reference Tracks</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setReferenceTracks([...referenceTracks, { title: '', url: '' }])}>
                            <Plus className="h-4 w-4 mr-2" /> Add Track
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {referenceTracks.map((rt: { title: string, url: string }, i: number) => (
                        <div key={i} className="flex gap-3 items-center bg-muted/30 p-2 rounded-md border border-transparent hover:border-border transition-colors">
                            <Input placeholder="Track Title / Artist" value={rt.title} onChange={e => {
                                const newTracks = [...referenceTracks]
                                newTracks[i].title = e.target.value
                                setReferenceTracks(newTracks)
                            }} className="flex-1 h-9 bg-background" />
                            <Input placeholder="URL (e.g. Spotify, YouTube)" value={rt.url} onChange={e => {
                                const newTracks = [...referenceTracks]
                                newTracks[i].url = e.target.value
                                setReferenceTracks(newTracks)
                            }} className="flex-[2] h-9 bg-background" />
                            {rt.url && isValidUrl(rt.url) && (
                                <Button variant="secondary" size="sm" className="h-9 px-3 shrink-0" asChild>
                                    <a href={rt.url.startsWith('http') ? rt.url : `https://${rt.url}`} target="_blank" rel="noopener noreferrer">
                                        Open
                                    </a>
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-destructive h-9 w-9 shrink-0 hover:bg-destructive/10" onClick={() => {
                                setReferenceTracks(referenceTracks.filter((_, index) => index !== i))
                            }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    {referenceTracks.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-6 border border-dashed rounded-md bg-muted/10">
                            No reference tracks added. Click &quot;Add Track&quot; to include inspirational links.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
