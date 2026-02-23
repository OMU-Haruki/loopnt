import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
    const { message } = await searchParams

    const signup = async (formData: FormData) => {
        'use server'
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const username = formData.get('username') as string

        if (!username) {
            return redirect('/signup?message=Username is required for sign up')
        }

        const supabase = await createClient()
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        })

        if (error) {
            return redirect(`/signup?message=${error.message}`)
        }

        return redirect('/login?message=Account created. Check email to continue sign in process')
    }

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                <h1 className="text-3xl font-bold mb-4">Create an Account</h1>

                {message && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20 text-center">
                        {message}
                    </div>
                )}

                <Label className="text-md" htmlFor="username">
                    Username
                </Label>
                <Input
                    className="mb-4 bg-inherit border"
                    name="username"
                    placeholder="Username"
                    required
                />

                <Label className="text-md" htmlFor="email">
                    Email
                </Label>
                <Input
                    className="mb-4 bg-inherit border"
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

                <Button formAction={signup} className="mb-2">
                    Sign Up
                </Button>

                <div className="text-sm text-center text-muted-foreground mt-4">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Log In
                    </Link>
                </div>
            </form>
        </div>
    )
}
