import { rechercherLesLieuxNationauxAction } from '@/app/_actions/statistiques/rechercher-les-lieux-nationaux.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { compterLesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/prisma/totaux-des-accompagnements.query'
import { totauxPresentes } from '@/features/activites/abilities/compter-les-accompagnements/ui/presenters/totaux.presenter'
import { BlocDesChiffresCles } from '@/features/activites/abilities/compter-les-accompagnements/ui/slots/BlocDesChiffresCles.slot'
import { compterLesAccompagnementsParCommune } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/implementations/prisma/accompagnements-par-commune.query'
import { parCommunePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/ui/presenters/par-commune.presenter'
import { compterLesAccompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/prisma/accompagnements-par-lieu.query'
import { parLieuPresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/presenters/par-lieu.presenter'
import { compterLesAccompagnementsParPeriode } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/implementations/prisma/accompagnements-par-periode.query'
import { parPeriodePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/presenters/par-periode.presenter'
import { BlocDuGraphique } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/slots/BlocDuGraphique.slot'
import { compterLesPersonnesAccompagneesParCommune } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/implementations/prisma/personnes-par-commune.query'
import { personnesParCommunePresentees } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/presenters/personnes-par-commune.presenter'
import { decrireLesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/prisma/profil-des-personnes-accompagnees.query'
import { profilPresente } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/presenters/profil.presenter'
import { BlocDuProfil } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/slots/BlocDuProfil.slot'
import { lieuxChoisisAvec } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/lieux-choisis.binding'
import { optionsDesLieuxChoisis } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux.presenter'
import { repartirLesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/prisma/repartition-des-accompagnements.query'
import { repartitionPresentee } from '@/features/activites/abilities/repartir-les-accompagnements/ui/presenters/repartition.presenter'
import { BlocDesCanauxEtDurees } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesCanauxEtDurees.slot'
import { BlocDesDemarches } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesDemarches.slot'
import { BlocDesMateriels } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesMateriels.slot'
import { BlocDesThematiques } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesThematiques.slot'
import { BlocDesTypesDActivite } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesTypesDActivite.slot'
import { repartirLesAccompagnementsParTag } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/implementations/prisma/accompagnements-par-tag.query'
import { parTagPresentes } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/presenters/par-tag.presenter'
import { BlocDesTags } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/slots/BlocDesTags.slot'
import { presenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/presence-de-cras-v1.binding'
import {
  criteresDesStatistiques,
  PERIMETRE_NATIONAL,
} from '@/features/activites/domain'
import {
  source,
  sourceOptionnelle,
  statistiquesAvec,
} from '@/features/activites/implementations/statistiques-en-cours.binding'
import { statistiquesNationalesEnCours } from '@/features/activites/implementations/statistiques-nationales.binding'
import { vocabulaireDesActivites } from '@/features/activites/ui/labels/libelles/vocabulaire-des-statistiques.labels'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { rdvStatusOptions } from '@/features/rdvsp/ui/presenters/statut-rdv'
import { StatistiquesNationales } from '@/features/statistiques/abilities/consulter-les-statistiques-nationales/ui/pages/StatistiquesNationales'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/action/rechercher-les-lieux-des-statistiques.key'
import type { ActivitesFilters } from '@/features/statistiques/domain/filtres-des-activites'
import {
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/components/sections-des-statistiques'
import { optionsDeTags } from '@/features/statistiques/ui/presenters/options-de-la-barre.presenter'
import { validateActivitesFilters } from '@/features/statistiques/ui/presenters/parametres-de-la-barre.search-params'
import { activiteSourceOptions } from '@/features/statistiques/ui/presenters/source-de-l-activite'
import { FiltreDeLieu } from '@/features/statistiques/ui/slots/FiltreDeLieu.slot'
import { lireLesTagsCollectifs } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/prisma/lire-les-tags-visibles.query'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
  hasCrasV1: presenceDeCrasV1,
})

export const metadata = {
  title: metadataTitle('Statistiques'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<
    ActivitesFilters & {
      graphique_fin?: string
    }
  >
}) => {
  await authenticateAdmin()
  const searchParams = await props.searchParams
  const activitesFilters = validateActivitesFilters(searchParams)
  const statistiques = statistiquesNationalesEnCours(
    statistiquesDesActivites.lancer,
    criteresDesStatistiques(activitesFilters),
    { tags: true, rendezVousAuxStatuts: rendezVousAuxStatutsSql },
  )
  const [tagsCollectifs, lieuxChoisis] = await Promise.all([
    lireLesTagsCollectifs(),
    lieuxChoisisAvec(optionsDesLieuxChoisis)(
      activitesFilters,
      PERIMETRE_NATIONAL,
    ),
  ])
  const tagsOptions = optionsDeTags(tagsCollectifs)

  return (
    <ClientBinder
      bind={RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY}
      to={rechercherLesLieuxNationauxAction}
    >
      <StatistiquesNationales
        activitesFilters={activitesFilters}
        vocabulaire={{
          ...vocabulaireDesActivites,
          statutsDeRendezVous: rdvStatusOptions,
        }}
        filtreDeLieu={<FiltreDeLieu choisis={lieuxChoisis} />}
        {...lieuxChoisis}
        tagsOptions={tagsOptions}
        activiteSourceOptions={activiteSourceOptions}
        generale={sectionGenerale(
          {
            chiffresCles: (
              <BlocDesChiffresCles totaux={statistiques.totalCounts} />
            ),
            graphique: <BlocDuGraphique periode={statistiques.periode} />,
          },
          {
            wording: 'generique',
          },
        )}
        activites={sectionActivites(
          {
            types: (
              <BlocDesTypesDActivite
                repartition={statistiques.repartition}
                totaux={statistiques.totalCounts}
              />
            ),
            thematiques: (
              <BlocDesThematiques repartition={statistiques.repartition} />
            ),
            demarches: (
              <BlocDesDemarches repartition={statistiques.repartition} />
            ),
            tags: <BlocDesTags tags={statistiques.tags} />,
            materiels: (
              <BlocDesMateriels repartition={statistiques.repartition} />
            ),
            canauxEtDurees: (
              <BlocDesCanauxEtDurees repartition={statistiques.repartition} />
            ),
            lieux: null,
            communes: null,
          },
          { wording: 'generique' },
        )}
        beneficiaires={sectionBeneficiaires(
          {
            profil: <BlocDuProfil profil={statistiques.profil} />,
            communes: null,
          },
          { wording: 'generique' },
        )}
      />
    </ClientBinder>
  )
}

export default Page
