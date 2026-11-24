import { rechercherLesLieuxNationauxAction } from '@/app/_actions/statistiques/rechercher-les-lieux-nationaux.action'
import { rechercherLesTagsCollectifsAction } from '@/app/_actions/statistiques/rechercher-les-tags-collectifs.action'
import { metadataTitle } from '@/configuration/projet/metadata-title'
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
import { tagsChoisis } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/tags-choisis.query'
import { lieuxDuFiltre } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-du-filtre.query'
import { lieuxDuFiltrePresentes } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/lieux-du-filtre.presenter'
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
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY } from '@/features/activites/action/rechercher-les-lieux-des-activites.key'
import { PERIMETRE_NATIONAL } from '@/features/activites/domain'
import {
  source,
  sourceOptionnelle,
  statistiquesAvec,
} from '@/features/activites/implementations/statistiques-en-cours.binding'
import { statistiquesNationalesEnCours } from '@/features/activites/implementations/statistiques-nationales.binding'
import { BarreDesStatistiques } from '@/features/activites/ui/components/filtres/BarreDesStatistiques'
import { criteresDesStatistiquesDesFiltres } from '@/features/activites/ui/filtres/activites.filtre'
import { filtresDesStatistiques } from '@/features/activites/ui/filtres/statistiques.filtre'
import { barreDesStatistiquesAvec } from '@/features/activites/ui/presenters/barre-des-statistiques.presenter'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { StatistiquesNationalesPage } from '@/features/statistiques/ui/pages/StatistiquesNationalesPage'
import {
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/slots/SectionsDesStatistiques.slot'
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
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  await authenticateAdmin()
  const parametres = await props.searchParams
  const valeurs = filtresDesStatistiques.charger(parametres)
  const statistiques = statistiquesNationalesEnCours(
    statistiquesDesActivites.lancer,
    criteresDesStatistiquesDesFiltres(valeurs),
    { tags: true, rendezVousAuxStatuts: rendezVousAuxStatutsSql },
  )
  const barre = await barreDesStatistiquesAvec({
    lieux: (choisis) =>
      lieuxDuFiltre(PERIMETRE_NATIONAL, choisis).then(lieuxDuFiltrePresentes),
    tagsSuggeres: lireLesTagsCollectifs,
    tagsChoisis,
    employeuses: async () => [],
    mediateurs: async () => [],
  })({ chemin: '/administration/statistiques', parametres }, valeurs)

  return (
    <ClientBinder
      bind={RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY}
      to={rechercherLesLieuxNationauxAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
        to={rechercherLesTagsCollectifsAction}
      >
        <StatistiquesNationalesPage
          barreDeFiltres={
            <BarreDesStatistiques
              barre={barre}
              periode={{ debut: new Date('2020-01-01') }}
              coordinateur={false}
              importsV1
              actions={null}
            />
          }
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
    </ClientBinder>
  )
}

export default Page
