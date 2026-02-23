import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
    const { message } = await searchParams
    const login = async (formData: FormData) => {
        'use server'
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const supabase = await createClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            return redirect(`/login?message=${error.message}`)
        }

        return redirect('/')
    }

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                <h1 className="text-3xl font-bold mb-4">Welcome Back</h1>

                {message && (
                    <div className={`text-sm p-3 rounded-md mb-4 border text-center ${message.includes('Account created') ? 'bg-green-500/15 text-green-600 border-green-500/20' : 'bg-destructive/15 text-destructive border-destructive/20'}`}>
                        {message}
                    </div>
                )}
                <Label className="text-md" htmlFor="email">
                    Email
                </Label>
                <Input
                    className="mb-6 bg-inherit border"
                    name="email"
                    placeholder="user@example.com"
                    required
                />
                <Label className="text-md" htmlFor="password">
                    Password
                </Label>
                <Input
                    className="mb-6 bg-inherit border"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />
                <Button formAction={login} className="mb-2">
                    Sign In
                </Button>

                <div className="text-sm text-center text-muted-foreground mt-4">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-primary hover:underline">
                        Create one here
                    </Link>
                </div>
            </form>
        </div>
    )
}
