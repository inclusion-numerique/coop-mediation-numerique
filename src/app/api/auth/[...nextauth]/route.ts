import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { nextAuthOptions } from '@/features/authentification/implementation/next-auth/auth'
import { isFirewallUserAgent } from '@/features/authentification/implementation/next-auth/isFirewallUserAgent'
import { importStructureEmployeuseFromProConnect } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementation/proconnect/importStructureEmployeuseFromProConnect'
import { rattacherAUneEmployeuseDepuisSiretBinding } from '@/features/employeuse/server'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const options = nextAuthOptions({
  garantirLeRoleCoordinateur: garantirLeRoleCoordinateurDuDispositif,
  importerLEmployeuseProConnect: importStructureEmployeuseFromProConnect(
    rattacherAUneEmployeuseDepuisSiretBinding,
  ),
})

const handler = (
  req: NextRequest,
  res: { params: Promise<{ nextauth: string[] }> },
) => {
  if (isFirewallUserAgent(req)) {
    return new Response('Bad Request', { status: 400 })
  }

  return NextAuth(req, res, options)
}

export { handler as GET, handler as POST }
