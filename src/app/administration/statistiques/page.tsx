import { rechercherLesLieuxNationauxAction } from '@/app/_actions/statistiques/rechercher-les-lieux-nationaux.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { totauxDesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/totaux-des-accompagnements.binding'
import { BlocDesChiffresCles } from '@/features/activites/abilities/compter-les-accompagnements/ui/slots/BlocDesChiffresCles.slot'
import { accompagnementsParCommune } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/implementations/accompagnements-par-commune.binding'
import { accompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/accompagnements-par-lieu.binding'
import { accompagnementsParPeriode } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/implementations/accompagnements-par-periode.binding'
import { BlocDuGraphique } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/slots/BlocDuGraphique.slot'
import { personnesParCommune } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/implementations/personnes-par-commune.binding'
import { profilDesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/profil-des-personnes-accompagnees.binding'
import { BlocDuProfil } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/slots/BlocDuProfil.slot'
import { lieuxChoisisDe } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/lieux-choisis.binding'
import { repartitionDesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/repartition-des-accompagnements.binding'
import { BlocDesCanauxEtDurees } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesCanauxEtDurees.slot'
import { BlocDesDemarches } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesDemarches.slot'
import { BlocDesMateriels } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesMateriels.slot'
import { BlocDesThematiques } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesThematiques.slot'
import { BlocDesTypesDActivite } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesTypesDActivite.slot'
import { accompagnementsParTag } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/implementations/accompagnements-par-tag.binding'
import { BlocDesTags } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/slots/BlocDesTags.slot'
import { presenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/presence-de-cras-v1.binding'
import {
  criteresDesStatistiques,
  PERIMETRE_NATIONAL,
} from '@/features/activites/domain'
import { statistiquesAvec } from '@/features/activites/implementations/statistiques-en-cours.binding'
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
  totalCounts: totauxDesAccompagnements,
  periode: accompagnementsParPeriode,
  repartition: repartitionDesAccompagnements,
  tags: accompagnementsParTag,
  structures: accompagnementsParLieu,
  communes: accompagnementsParCommune,
  profil: profilDesPersonnesAccompagnees,
  residences: personnesParCommune,
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
    lieuxChoisisDe(activitesFilters, PERIMETRE_NATIONAL),
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
