import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppState {
    guestMode: boolean
    setGuestMode: (value: boolean) => void
    userId: string | null
    setUserId: (id: string | null) => void
    localProjects: any[]
    addLocalProject: (project: any) => void
    updateLocalProject: (id: string, projectUpdates: any) => void
    deleteLocalProject: (id: string) => void
    currentProject: any // Keep for backward compatibility or active state if needed, but not strictly necessary if using URL param. Rely on localProjects for the list.
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            guestMode: true,
            setGuestMode: (value) => set({ guestMode: value }),
            userId: null,
            setUserId: (id) => set({ userId: id }),
            currentProject: null,
            localProjects: [],
            addLocalProject: (project) => set((state) => ({ localProjects: [project, ...state.localProjects] })),
            updateLocalProject: (id, updates) => set((state) => ({
                localProjects: state.localProjects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
            })),
            deleteLocalProject: (id) => set((state) => ({
                localProjects: state.localProjects.filter(p => p.id !== id)
            })),
        }),
        {
            name: 'loopnt-storage',
        }
    )
)
