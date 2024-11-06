"use client"
import { useSession, signIn, signOut } from "next-auth/react"

export default function SignInPage() {
    const { data: session } = useSession()
    if (!session) {
        return (
            <div className="bg-blue-800 w-screen h-screen flex justify-items-center items-center justify-center">
                <button
                    onClick={() => signIn("google")}
                    className="bg-white px-4 py-3 text-lg font-extralight rounded-lg text-black">
                    Sign In
                </button>
            </div>
        )
    }

    return (
        <div className="bg-indigo-600 w-screen h-screen flex flex-col justify-center items-center rounded-lg text-black">
            <h1 className="text-xl font-bold p-4">
                Your signed in as, {session.user!.name}
            </h1>
            <button
                onClick={() => signOut()}
                className="bg-white px-4 py-3 text-lg rounded-lg font-extralight">
                    Sign out
                </button>
        </div>
    )
}