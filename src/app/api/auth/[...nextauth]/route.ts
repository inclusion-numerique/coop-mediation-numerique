import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { geocoder } from '@/configuration/ban'
import { signaler } from '@/configuration/telemetry/serveur'
import { nextAuthOptions } from '@/features/authentification/implementations/next-auth/next-auth.client'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/rattacher-a-une-employeuse'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import { estConseillerNumeriqueEnPoste } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/conseiller-numerique-en-poste.query'
import { creerLEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/creer-l-employeuse.mutation'
import { lireLesEmployeusesDuSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/employeuses-du-siret.query'
import { enregistrerLeRattachement } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/enregistrer-le-rattachement.mutation'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/domain/garantir-le-role-coordinateur-du-dispositif'
import { creerLeRoleCoordinateur } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/creer-le-role-coordinateur.mutation'
import {
  aLeRoleCoordinateur,
  coordonneDansLeDispositif,
} from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/role-coordinateur.query'
import { isFirewallUserAgent } from '@/libraries/nextjs'

const rattacher = rattacherAUneEmployeuse({
  lireLEtablissement: etablissementDepuisSiret,
  estConseillerNumeriqueEnPoste,
  lireLesEmployeusesDuSiret: lireLesEmployeusesDuSiret(signaler),
  creerLEmployeuse: creerLEmployeuse({ geocoder, signaler }),
  enregistrerLeRattachement: enregistrerLeRattachement({
    garantirLaPersonne: ensurePersonneMain,
    synchroniserLaPersonne: synchroniserPersonne,
  }),
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

const options = nextAuthOptions({
  garantirLeRoleCoordinateur: (utilisateurId: string) =>
    garantirLeRoleCoordinateurDuDispositif({
      aLeRoleCoordinateur,
      coordonneDansLeDispositif,
      creerLeRoleCoordinateur: creerLeRoleCoordinateur(synchroniserPersonne),
    })({ utilisateurId }),
  importerLEmployeuseProConnect: ({ userId, siret }) =>
    rattacher({ userId, source: { _tag: 'ProConnect', siret: siret ?? null } }),
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
