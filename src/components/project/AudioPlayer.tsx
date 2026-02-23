'use client'

import React, { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, Upload, Volume2, VolumeX, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

export default function AudioPlayer({ project, isLocal, projectId }: { project: any, isLocal: boolean, projectId?: string }) {
    const waveformRef = useRef<HTMLDivElement>(null)
    const wavesurfer = useRef<WaveSurfer | null>(null)
    const router = useRouter()
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasAudio, setHasAudio] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const localProjects = useStore((state) => state.localProjects)
    const updateLocalProject = useStore((state) => state.updateLocalProject)
    const localProject = localProjects.find(p => p.id === projectId)

    const current = isLocal ? localProject : project

    useEffect(() => {
        if (waveformRef.current) {
            wavesurfer.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#a0a0a0',
                progressColor: '#ef4444',
                cursorColor: '#ef4444',
                cursorWidth: 2,
                barWidth: 2,
                barRadius: 2,
                height: 80,
                normalize: true,
                interact: true,
            })

            wavesurfer.current.on('play', () => setIsPlaying(true))
            wavesurfer.current.on('pause', () => setIsPlaying(false))

            // If project has an audio URL, load it
            if (current?.demoAudioUrl) {
                wavesurfer.current.load(current.demoAudioUrl).catch((err) => {
                    if (err.name === 'AbortError') return
                    console.error('Audio load error:', err)
                })
                setHasAudio(true)
            }

            return () => {
                try {
                    wavesurfer.current?.destroy()
                } catch (e) {
                    // Ignore AbortError when unmounting while fetching audio
                }
            }
        }
    }, [current?.demoAudioUrl])

    const handlePlayPause = () => {
        wavesurfer.current?.playPause()
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const url = URL.createObjectURL(file)

        // Optimistic UI load
        wavesurfer.current?.load(url).catch((err) => {
            if (err.name === 'AbortError') return
            console.error('Audio upload load error:', err)
        })
        setHasAudio(true)

        if (isLocal && projectId) {
            updateLocalProject(projectId, { demoAudioUrl: url })
            setIsUploading(false)
            return
        }

        // Upload to API if authenticated
        if (current?.id) {
            const formData = new FormData()
            formData.append('file', file)

            try {
                const res = await fetch(`/api/projects/${current.id}/audio`, {
                    method: 'POST',
                    body: formData
                })
                const data = await res.json()
                if (data.url) {
                    router.refresh()
                }
            } catch (err) {
                console.error("Audio upload failed", err)
            } finally {
                setIsUploading(false)
            }
        }
    }

    const toggleMute = () => {
        if (!wavesurfer.current) return
        const muted = !isMuted
        wavesurfer.current.setMuted(muted)
        setIsMuted(muted)
    }

    const handleDeleteAudio = async () => {
        if (!window.confirm("Are you sure you want to delete this track?")) return
        setIsDeleting(true)

        if (isLocal && projectId) {
            updateLocalProject(projectId, { demoAudioUrl: null })
            wavesurfer.current?.empty()
            setHasAudio(false)
            setIsPlaying(false)
            setIsDeleting(false)
            return
        }

        if (current?.id) {
            try {
                const res = await fetch(`/api/projects/${current.id}/audio`, {
                    method: 'DELETE'
                })
                if (res.ok) {
                    wavesurfer.current?.empty()
                    setHasAudio(false)
                    setIsPlaying(false)
                    router.refresh()
                }
            } catch (err) {
                console.error("Audio deletion failed", err)
            } finally {
                setIsDeleting(false)
            }
        }
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Demo Audio</CardTitle>
                    <div className="flex items-center gap-2">
                        {!hasAudio && !isLocal && (
                            <label className="cursor-pointer">
                                <Input
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <Button variant="outline" size="sm" asChild disabled={isUploading}>
                                    <span>
                                        <Upload className="mr-2 h-4 w-4" /> {isUploading ? 'Uploading...' : 'Upload'}
                                    </span>
                                </Button>
                            </label>
                        )}
                        {!hasAudio && isLocal && (
                            <Button variant="outline" size="sm" onClick={() => router.push('/login')} title="Log in to use audio demo features">
                                <Upload className="mr-2 h-4 w-4" /> Login to Upload
                            </Button>
                        )}
                        {hasAudio && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDeleteAudio} disabled={isDeleting} title="Delete Audio">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" disabled={!hasAudio} onClick={toggleMute}>
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Waveform Container */}
                <div ref={waveformRef} className="w-full bg-muted/50 rounded-md my-4" />

                {/* Controls */}
                <div className="flex justify-center items-center gap-4 mt-2">
                    <Button
                        variant="default"
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-lg"
                        onClick={handlePlayPause}
                        disabled={!hasAudio}
                    >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
