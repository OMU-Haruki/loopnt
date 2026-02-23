'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

// Basic Drag&Drop Context hooks
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'


import { useStore } from '@/store/useStore'

interface Section {
    id: string
    name: string
    lengthBars: number
    memo: string
}

export default function StructureBuilder({ project, isLocal, projectId }: { project: any, isLocal: boolean, projectId?: string }) {
    const localProjects = useStore((state) => state.localProjects)
    const updateLocalProject = useStore((state) => state.updateLocalProject)

    const localProject = localProjects.find(p => p.id === projectId)
    const current = isLocal ? localProject : project

    const [sections, setSections] = useState<Section[]>([
        { id: '1', name: 'Intro', lengthBars: 8, memo: '' },
        { id: '2', name: 'Verse 1', lengthBars: 16, memo: '' },
        { id: '3', name: 'Chorus', lengthBars: 8, memo: '' },
    ])

    const [isLoaded, setIsLoaded] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    React.useEffect(() => {
        if (current && !isLoaded) {
            if (current.songStructures?.length > 0) {
                setSections(current.songStructures)
            }
            setIsLoaded(true)
        }
    }, [current, isLoaded])

    React.useEffect(() => {
        if (!isLoaded) return; // Prevent saving default state before load
        if (isLocal && projectId) {
            updateLocalProject(projectId, { songStructures: sections })
        } else if (!isLocal && current?.id) {
            // API sync for authenticated users
            fetch(`/api/projects/${current.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songStructures: sections })
            }).catch(console.error)
        }
    }, [sections, isLocal, projectId, updateLocalProject, isLoaded, current?.id])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id)
                const newIndex = items.findIndex(i => i.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const addSection = () => {
        const newSec = { id: Math.random().toString(), name: 'New Section', lengthBars: 8, memo: '' }
        setSections([...sections, newSec])
    }

    const deleteSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id))
    }

    const updateSection = (id: string, updates: Partial<Section>) => {
        setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s))
    }

    return (
        <Card className="h-full border-primary/20 bg-muted/20">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle>Structure Builder</CardTitle>
                    <Button variant="outline" size="sm" onClick={addSection}>
                        <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isMounted ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {sections.map(section => (
                                    <SortableItem key={section.id} section={section} onDelete={deleteSection} onUpdate={updateSection} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="space-y-3 opacity-50">
                        <div className="h-20 bg-muted rounded-md animate-pulse"></div>
                        <div className="h-20 bg-muted rounded-md animate-pulse"></div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function SortableItem({ section, onDelete, onUpdate }: { section: Section, onDelete: (id: string) => void, onUpdate: (id: string, updates: Partial<Section>) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="flex border rounded-md bg-background shadow-sm hover:border-primary/50 transition-colors">
            <div {...attributes} {...listeners} className="px-2 flex items-center bg-muted cursor-grab text-muted-foreground hover:text-foreground touch-none">
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 p-3">
                <div className="flex justify-between items-start mb-2">
                    <Input
                        value={section.name}
                        onChange={(e) => onUpdate(section.id, { name: e.target.value })}
                        className="h-7 w-32 px-2 py-0 border-transparent font-semibold bg-transparent hover:border-border"
                    />
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Input
                            type="number"
                            value={section.lengthBars}
                            onChange={(e) => onUpdate(section.id, { lengthBars: Number(e.target.value) })}
                            className="h-7 w-16 px-2 py-0 border-transparent bg-transparent hover:border-border text-right"
                        />
                        <span className="ml-1 mr-2">Bars</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => onDelete(section.id)}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
                <Textarea
                    value={section.memo}
                    onChange={(e) => onUpdate(section.id, { memo: e.target.value })}
                    placeholder="Notes..."
                    className="min-h-[60px] px-2 py-2 text-xs border-transparent bg-transparent text-muted-foreground hover:border-border resize-y"
                />
            </div>
        </div>
    )
}
