import type { NextRequest } from 'next/server'
import { tagsRappeles } from '@/features/activites/abilities/exporter-les-activites-de-coordination/domain/tags-rappeles'
import { classeurDeMesCoordinations } from '@/features/activites/abilities/exporter-les-activites-de-coordination/implementations/excel/classeur-de-mes-coordinations.classeur'
import { exporterLesActivitesDeCoordination } from '@/features/activites/abilities/exporter-les-activites-de-coordination/implementations/prisma/activites-a-exporter.query'
import { lignesDesCoordinations } from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui/presenters/lignes-des-coordinations.presenter'
import { nomDuFichierDesCoordinations } from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui/presenters/nom-du-fichier.presenter'
import { CoordinateurId } from '@/features/activites/domain'
import { tagsUtilisablesDepuis } from '@/features/activites/domain/fournisseurs-de-la-saisie'
import {
  criteresDesFiltresDeCoordination,
  filtresDesCoordinations,
} from '@/features/activites/ui/filtres/coordinations.filtre'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/prisma/tags-visibles-par.query'
import { acteurDe } from '@/features/tags/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const user = await utilisateurDuJetonDeSession(
    jetonDeSessionDesCookies(request.cookies),
  )
  if (!user?.coordinateur) return new Response('Unauthorized', { status: 401 })

  const criteres = criteresDesFiltresDeCoordination(
    filtresDesCoordinations.charger(request.nextUrl.searchParams),
  )
  const [activites, tags] = await Promise.all([
    exporterLesActivitesDeCoordination({
      coordinateurId: CoordinateurId(user.coordinateur.id),
      criteres,
    }),
    tagsRappeles({
      criteres,
      tagsUtilisables: tagsUtilisablesDepuis(
        tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
      ),
    }),
  ])
  const classeur = classeurDeMesCoordinations({
    activites,
    tags,
    criteres,
    auteur: auteurDeLExport(user),
    fuseau: user.timezone,
    presenter: lignesDesCoordinations,
  })

  const donnees = await classeur.xlsx.writeBuffer()

  return new Response(donnees, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nomDuFichierDesCoordinations(new Date())}"`,
    },
  })
}
