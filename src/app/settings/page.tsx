'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            const sb = createClient()
            const { data: { user } } = await sb.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUsername(user.user_metadata?.username || '')
            setLoading(false)
        }
        fetchUser()
    }, [router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')

        const sb = createClient()
        const { error } = await sb.auth.updateUser({
            data: { username: username.trim() }
        })

        setSaving(false)

        if (error) {
            setMessage(`Failed to update username: ${error.message}`)
        } else {
            setMessage('Username updated successfully!')
            router.refresh()
        }
    }

    if (loading) return null

    return (
        <div className="w-full max-w-xl mx-auto p-6 mt-10">
            <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

            <form onSubmit={handleSave} className="space-y-6 bg-card border rounded-lg p-6">
                <div className="space-y-2">
                    <Label htmlFor="username">Username / Artist Name</Label>
                    <Input
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="e.g. DJ Loop"
                        required
                    />
                    <p className="text-sm text-muted-foreground">
                        This name will be automatically applied as the default Artist Name on your new projects.
                    </p>
                </div>

                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-600 border border-green-500/50' : 'bg-red-500/10 text-red-600 border border-red-500/50'}`}>
                        {message}
                    </div>
                )}

                <div className="pt-2 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.push('/')}>
                        Dashboard
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
