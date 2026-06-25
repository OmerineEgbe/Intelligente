import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

// Re-export hooks
export const useSession = () => authClient.useSession()
export const signOut = () => authClient.signOut()
