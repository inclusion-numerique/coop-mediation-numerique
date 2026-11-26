import type { NextRequest } from 'next/server'
import { compterLesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/prisma/totaux-des-accompagnements.query'
import { totauxPresentes } from '@/features/activites/abilities/compter-les-accompagnements/ui/presenters/totaux.presenter'
import { compterLesAccompagnementsParCommune } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/implementations/prisma/accompagnements-par-commune.query'
import { parCommunePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/ui/presenters/par-commune.presenter'
import { compterLesAccompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/prisma/accompagnements-par-lieu.query'
import { parLieuPresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/presenters/par-lieu.presenter'
import { compterLesAccompagnementsParPeriode } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/implementations/prisma/accompagnements-par-periode.query'
import { parPeriodePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/presenters/par-periode.presenter'
import { compterLesPersonnesAccompagneesParCommune } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/implementations/prisma/personnes-par-commune.query'
import { personnesParCommunePresentees } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/presenters/personnes-par-commune.presenter'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre/implementations/prisma/activites-du-perimetre.query'
import { decrireLesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/prisma/profil-des-personnes-accompagnees.query'
import { profilPresente } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/presenters/profil.presenter'
import { tagsChoisis } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/tags-choisis.query'
import { tagsLesPlusUtilisesDuPerimetre } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/tags-du-perimetre.query'
import { employeusesEnOptions } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/ui/presenters/options-d-employeuses.presenter'
import { lieuxDuFiltre } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-du-filtre.query'
import { lieuxDuFiltrePresentes } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/lieux-du-filtre.presenter'
import { repartirLesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/prisma/repartition-des-accompagnements.query'
import { repartitionPresentee } from '@/features/activites/abilities/repartir-les-accompagnements/ui/presenters/repartition.presenter'
import { repartirLesAccompagnementsParTag } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/implementations/prisma/accompagnements-par-tag.query'
import { parTagPresentes } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/presenters/par-tag.presenter'
import { verifierLaPresenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/domain/verifier-la-presence-de-cras-v1'
import { mediateurAvecCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/prisma/mediateur-avec-cras-v1.query'
import { presenceDeCrasV1Presentee } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/ui/presenters/presence-de-cras-v1.presenter'
import type { PerimetreDesStatistiques } from '@/features/activites/domain'
import { statistiquesDuPerimetre } from '@/features/activites/implementations/prisma/statistiques/statistiques-du-perimetre.query'
import {
  source,
  sourceOptionnelle,
  statistiquesAvec,
} from '@/features/activites/implementations/prisma/statistiques/statistiques-en-cours.query'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre.query'
import { criteresDesStatistiquesDesFiltres } from '@/features/activites/ui/filtres/activites.filtre'
import { filtresDesStatistiques } from '@/features/activites/ui/filtres/statistiques.filtre'
import { barreDesStatistiquesAvec } from '@/features/activites/ui/presenters/barre-des-statistiques.presenter'
import {
  utilisateurDeLaSessionParId,
  utilisateurDuJetonDeSession,
} from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { listerLesMembresAFiltrer } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/domain/lister-les-membres-a-filtrer'
import {
  lireLeDemandeur,
  lireLesMembresAFiltrer,
} from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/prisma/membres-a-filtrer.query'
import { demandeurDuFiltre } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/session/demandeur-du-filtre.query'
import { optionDeMembre } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/ui/presenters/options-de-membres.presenter'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { classeurDesStatistiques } from '@/features/statistiques/implementations/excel/classeur-des-statistiques.classeur'
import { entreeDuClasseur } from '@/features/statistiques/ui/presenters/entree-du-classeur.presenter'
import { nomDuFichierDesStatistiques } from '@/features/statistiques/ui/presenters/nom-du-fichier.presenter'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'

const statistiquesDesActivites = statistiquesAvec({
  totalCounts: source(compterLesAccompagnements, totauxPresentes),
  periode: source(compterLesAccompagnementsParPeriode, parPeriodePresentes),
  repartition: source(repartirLesAccompagnements, repartitionPresentee),
  tags: sourceOptionnelle(repartirLesAccompagnementsParTag, parTagPresentes),
  structures: sourceOptionnelle(
    compterLesAccompagnementsParLieu,
    parLieuPresentes,
  ),
  communes: sourceOptionnelle(
    compterLesAccompagnementsParCommune,
    parCommunePresentes,
  ),
  profil: source(decrireLesPersonnesAccompagnees, profilPresente),
  residences: sourceOptionnelle(
    compterLesPersonnesAccompagneesParCommune,
    personnesParCommunePresentees,
  ),
  hasCrasV1: (perimetre) =>
    verifierLaPresenceDeCrasV1({ mediateurAvecCrasV1 })({ perimetre }).then(
      presenceDeCrasV1Presentee,
    ),
})

const lecturesDeLaBarre = (
  perimetre: PerimetreDesStatistiques,
  membres: () => Promise<readonly { value: string; label: string }[]>,
) => ({
  lieux: (choisis: Parameters<typeof lieuxDuFiltre>[1]) =>
    lieuxDuFiltre(perimetre, choisis).then(lieuxDuFiltrePresentes),
  tagsSuggeres: () => tagsLesPlusUtilisesDuPerimetre(perimetre),
  tagsChoisis,
  employeuses: async () =>
    employeusesEnOptions(
      (await decrireLesActivitesDuPerimetre(perimetre)).employeuses,
    ),
  mediateurs: membres,
})

const classeurDuPerimetre = async (
  perimetre: PerimetreDesStatistiques,
  valeurs: ReturnType<typeof filtresDesStatistiques.charger>,
  membres: () => Promise<readonly { value: string; label: string }[]>,
) => {
  const [statistiques, barre] = await Promise.all([
    statistiquesDesActivites.rassembler(
      statistiquesDuPerimetre(
        statistiquesDesActivites.lancer,
        rendezVousAuxStatutsSql,
      )({
        perimetre,
        criteres: criteresDesStatistiquesDesFiltres(valeurs),
        fin: valeurs.au ?? new Date(),
      }),
    ),
    barreDesStatistiquesAvec(lecturesDeLaBarre(perimetre, membres))(
      { chemin: '', parametres: {} },
      valeurs,
    ),
  ])
  return { statistiques, etiquettes: barre.etiquettes }
}

const optionsDesMembres = async (
  user: Parameters<typeof demandeurDuFiltre>[0],
) => {
  const membres = await listerLesMembresAFiltrer({
    lireLeDemandeur,
    lireLesMembresAFiltrer,
  })({ ...demandeurDuFiltre(user), recherche: null })
  return membres.success ? membres.data.map(optionDeMembre) : []
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const administrateur = await utilisateurDuJetonDeSession(
    jetonDeSessionDesCookies(request.cookies),
  )

  if (!administrateur) return new Response('Unauthorized', { status: 401 })
  if (administrateur.role !== 'Admin')
    return new Response('Forbidden', { status: 403 })

  const utilisateurId = UtilisateurId.safe((await params).id)
  if (utilisateurId === null) return new Response('Not found', { status: 404 })

  const user = await utilisateurDeLaSessionParId(utilisateurId)
  const perimetre = perimetreDeLUtilisateur(user)
  if (perimetre === null) return new Response('Not found', { status: 404 })

  const workbook = classeurDesStatistiques(
    entreeDuClasseur({
      ...(await classeurDuPerimetre(
        perimetre,
        filtresDesStatistiques.charger(request.nextUrl.searchParams),
        async () => optionsDesMembres(user),
      )),
      auteur: auteurDeLExport(administrateur),
      fuseau: user.timezone,
    }),
  )

  return new Response(await workbook.xlsx.writeBuffer(), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nomDuFichierDesStatistiques(new Date())}"`,
    },
  })
}
