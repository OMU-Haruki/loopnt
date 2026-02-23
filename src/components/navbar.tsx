import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const displayName = user?.user_metadata?.username || user?.email

    return (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                    <Link href={'/'}>loopn&apos;t</Link>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            Hey, <span className="font-semibold">{displayName}</span>!
                            <Link href="/settings">
                                <Button variant="ghost" size="icon" title="Settings" className="text-muted-foreground hover:text-foreground">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </Link>
                            <form action={async () => {
                                'use server'
                                const sb = await createClient()
                                await sb.auth.signOut()
                                redirect('/')
                            }}>
                                <Button variant="outline" size="sm">
                                    Logout
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground hidden sm:inline-block">
                                Guest Mode
                            </span>
                            <Link href="/login" className="btn btn-primary">
                                <Button size="sm">Login</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
