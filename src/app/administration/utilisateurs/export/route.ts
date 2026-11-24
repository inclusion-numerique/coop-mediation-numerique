import type { NextRequest } from 'next/server'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { nomDeLEmployeuse } from '@/features/employeuse/abilities/consulter-employeuse/implementations/prisma/nom-de-l-employeuse.query'
import { communesDesEmployeuses } from '@/features/employeuse/abilities/rechercher-employeuse/implementations/prisma/communes-des-employeuses.query'
import { lieuxChoisis } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/lieux-a-choisir.query'
import { classeurDesUtilisateurs } from '@/features/utilisateurs/abilities/exporter-les-utilisateurs/implementations/excel/classeur-des-utilisateurs.classeur'
import { utilisateursAExporter } from '@/features/utilisateurs/abilities/exporter-les-utilisateurs/implementations/prisma/utilisateurs-a-exporter.query'
import { colonnesDeLExport } from '@/features/utilisateurs/abilities/exporter-les-utilisateurs/ui/presenters/colonnes-de-l-export.presenter'
import { optionsDesFiltres } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/implementations/prisma/options-des-filtres.query'
import { optionDuCoordinateur } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/presenters/coordinateur-a-choisir.presenter'
import {
  filtresDesUtilisateurs,
  filtresUtilisateursDesFiltres,
} from '@/features/utilisateurs/ui/filtres/utilisateurs.filtre'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'
import { barreDesUtilisateurs } from '@/features/utilisateurs/ui/presenters/barre-des-utilisateurs.presenter'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
import { motsDe } from '@/libraries/texte/mots'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const auteur = await utilisateurDuJetonDeSession(
    jetonDeSessionDesCookies(request.cookies),
  )

  if (auteur?.role !== 'Admin') return new Response(null, { status: 403 })

  const valeurs = filtresDesUtilisateurs.charger(request.nextUrl.searchParams)
  const filtres = filtresUtilisateursDesFiltres(valeurs)
  const maintenant = new Date()

  const [utilisateurs, options] = await Promise.all([
    utilisateursAExporter({
      mots: motsDe(valeurs.recherche),
      filtres,
      maintenant,
    }),
    optionsDesFiltres(filtres, {
      optionDuCoordinateur,
      communes: communesDesEmployeuses,
      lieux: lieuxChoisis,
      nomDeLEmployeuse,
    }),
  ])

  const classeur = classeurDesUtilisateurs({
    utilisateurs,
    auteur: auteurDeLExport(auteur),
    filtres: barreDesUtilisateurs({
      adresse: { chemin: '', parametres: {} },
      valeurs,
      options,
    }).etiquettes.map(({ titre, libelle }) => ({
      type: titre,
      valeur: libelle,
    })),
    genereLe: maintenant,
    colonnes: colonnesDeLExport,
  })

  return new Response(await classeur.xlsx.writeBuffer(), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="coop-numerique_utilisateurs_${dateAsIsoDay(maintenant)}.xlsx"`,
    },
  })
}
