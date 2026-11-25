'use client'

import { signOut } from 'next-auth/react'
import type { ReactNode } from 'react'
import { ClientBinder } from '@/libraries/nextjs/injection'
import { SE_DECONNECTER_KEY } from '../../action/se-deconnecter.key'

const seDeconnecter = async (destination?: string) => {
  await (destination === undefined
    ? signOut()
    : signOut({ redirect: true, callbackUrl: destination }))
}

export const LierLaDeconnexion = ({ children }: { children: ReactNode }) => (
  <ClientBinder bind={SE_DECONNECTER_KEY} to={seDeconnecter}>
    {children}
  </ClientBinder>
)
