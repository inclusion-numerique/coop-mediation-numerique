import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { nextAuthOptions } from '@/features/authentification/implementations/next-auth/next-auth.client'
import { importerLaStructureEmployeuseDepuisProConnect } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/proconnect/importer-la-structure-employeuse-depuis-proconnect.mutation'
import { rattacherAUneEmployeuseDepuisSiretBinding } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/rattacher-a-une-employeuse.binding'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/garantir-le-role-coordinateur.mutation'
import { isFirewallUserAgent } from '@/libraries/nextjs'

const registreDesPersonnes = {
  garantirLaPersonne: ensurePersonneMain,
  synchroniserLaPersonne: synchroniserPersonne,
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const options = nextAuthOptions({
  garantirLeRoleCoordinateur:
    garantirLeRoleCoordinateurDuDispositif(synchroniserPersonne),
  importerLEmployeuseProConnect: importerLaStructureEmployeuseDepuisProConnect(
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
