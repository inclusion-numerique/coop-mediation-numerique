import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { geocoder } from '@/configuration/ban'
import { signaler } from '@/configuration/telemetry/serveur'
import { nextAuthOptions } from '@/features/authentification/implementations/next-auth/next-auth.client'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import { estConseillerNumeriqueEnPoste } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/conseiller-numerique-en-poste.query'
import type { RegistreDesPersonnes } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-a-une-employeuse.mutation'
import { rattacherAUneEmployeuseDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-depuis-siret.mutation'
import { importerLaStructureEmployeuseDepuisProConnect } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/proconnect/importer-la-structure-employeuse-depuis-proconnect.mutation'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/garantir-le-role-coordinateur.mutation'
import { isFirewallUserAgent } from '@/libraries/nextjs'

const services = {
  geocoder,
  signaler,
  etablissementDepuisSiret,
}

const rattacherDepuisLeSiretAvec = (registre: RegistreDesPersonnes) =>
  rattacherAUneEmployeuseDepuisSiret({ ...services, ...registre })

const registreDesPersonnes = {
  garantirLaPersonne: ensurePersonneMain,
  synchroniserLaPersonne: synchroniserPersonne,
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const options = nextAuthOptions({
  garantirLeRoleCoordinateur:
    garantirLeRoleCoordinateurDuDispositif(synchroniserPersonne),
  importerLEmployeuseProConnect: importerLaStructureEmployeuseDepuisProConnect({
    rattacherDepuisSiret: rattacherDepuisLeSiretAvec(registreDesPersonnes),
    estConseillerNumeriqueEnPoste,
  }),
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
