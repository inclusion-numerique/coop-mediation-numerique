import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { nextAuthOptions } from '@/features/authentification/implementations/next-auth/auth'
import { isFirewallUserAgent } from '@/features/authentification/implementations/next-auth/is-firewall-user-agent'
import { importStructureEmployeuseFromProConnect } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/proconnect/importStructureEmployeuseFromProConnect'
import { rattacherAUneEmployeuseDepuisSiretBinding } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/rattacher-a-une-employeuse.binding'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/garantir-le-role-coordinateur.mutation'

const registreDesPersonnes = {
  garantirLaPersonne: ensurePersonneMain,
  synchroniserLaPersonne: synchroniserPersonne,
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const options = nextAuthOptions({
  garantirLeRoleCoordinateur:
    garantirLeRoleCoordinateurDuDispositif(synchroniserPersonne),
  importerLEmployeuseProConnect: importStructureEmployeuseFromProConnect(
    rattacherAUneEmployeuseDepuisSiretBinding(registreDesPersonnes),
  ),
  synchroniserLaPersonne: synchroniserPersonne,
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
