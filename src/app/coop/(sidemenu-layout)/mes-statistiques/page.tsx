import type { Metadata } from 'next'
import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { rechercherDesMembresAction } from '@/app/_actions/equipe/rechercher-des-membres.action'
import { reglerLePartageStatistiquesAction } from '@/app/_actions/mediateurs/regler-le-partage-statistiques.action'
import { rechercherLesLieuxDeMesStatistiquesAction } from '@/app/_actions/statistiques/rechercher-les-lieux-de-mes-statistiques.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { metadataTitle } from '@/configuration/projet'
import { compterLesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/prisma/totaux-des-accompagnements.query'
import { totauxPresentes } from '@/features/activites/abilities/compter-les-accompagnements/ui/presenters/totaux.presenter'
import { BlocDesChiffresCles } from '@/features/activites/abilities/compter-les-accompagnements/ui/slots/BlocDesChiffresCles.slot'
import { ChiffresClesImprimes } from '@/features/activites/abilities/compter-les-accompagnements/ui/slots/ChiffresClesImprimes.slot'
import { compterLesAccompagnementsParCommune } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/implementations/prisma/accompagnements-par-commune.query'
import { parCommunePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/ui/presenters/par-commune.presenter'
import { BlocDesCommunes } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/ui/slots/BlocDesCommunes.slot'
import { compterLesAccompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/prisma/accompagnements-par-lieu.query'
import { parLieuPresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/presenters/par-lieu.presenter'
import { BlocDesLieux } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/slots/BlocDesLieux.slot'
import { LieuxImprimes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/slots/LieuxImprimes.slot'
import { compterLesAccompagnementsParPeriode } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/implementations/prisma/accompagnements-par-periode.query'
import { parPeriodePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/presenters/par-periode.presenter'
import { BlocDuGraphique } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/slots/BlocDuGraphique.slot'
import { GraphiquesImprimes } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/slots/GraphiquesImprimes.slot'
import { compterLesPersonnesAccompagneesParCommune } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/implementations/prisma/personnes-par-commune.query'
import { personnesParCommunePresentees } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/presenters/personnes-par-commune.presenter'
import { BlocDesCommunesDeResidence } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/slots/BlocDesCommunesDeResidence.slot'
import { CommunesDeResidenceImprimees } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/slots/CommunesDeResidenceImprimees.slot'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre/implementations/prisma/activites-du-perimetre.query'
import { decrireLesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/prisma/profil-des-personnes-accompagnees.query'
import { profilPresente } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/presenters/profil.presenter'
import { BlocDuProfil } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/slots/BlocDuProfil.slot'
import { ProfilImprime } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/slots/ProfilImprime.slot'
import { tagsChoisis } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/tags-choisis.query'
import { tagsLesPlusUtilisesDuPerimetre } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/tags-du-perimetre.query'
import { employeusesEnOptions } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/ui/presenters/options-d-employeuses.presenter'
import { lieuxDuFiltre } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-du-filtre.query'
import { lieuxDuFiltrePresentes } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/lieux-du-filtre.presenter'
import { repartirLesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/prisma/repartition-des-accompagnements.query'
import { repartitionPresentee } from '@/features/activites/abilities/repartir-les-accompagnements/ui/presenters/repartition.presenter'
import { BlocDesCanauxEtDurees } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesCanauxEtDurees.slot'
import { BlocDesDemarches } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesDemarches.slot'
import { BlocDesMateriels } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesMateriels.slot'
import { BlocDesThematiques } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesThematiques.slot'
import { BlocDesTypesDActivite } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesTypesDActivite.slot'
import { CanauxImprimes } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/CanauxImprimes.slot'
import { DureesImprimees } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/DureesImprimees.slot'
import { MaterielsImprimes } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/MaterielsImprimes.slot'
import { TypesDActiviteImprimes } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/TypesDActiviteImprimes.slot'
import { repartirLesAccompagnementsParTag } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/implementations/prisma/accompagnements-par-tag.query'
import { parTagPresentes } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/presenters/par-tag.presenter'
import { BlocDesTags } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/slots/BlocDesTags.slot'
import { verifierLaPresenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/domain/verifier-la-presence-de-cras-v1'
import { mediateurAvecCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/prisma/mediateur-avec-cras-v1.query'
import { presenceDeCrasV1Presentee } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/ui/presenters/presence-de-cras-v1.presenter'
import { RECHERCHER_DES_MEDIATEURS_DES_ACTIVITES_KEY } from '@/features/activites/action/rechercher-des-mediateurs.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/action/rechercher-employeuses.key'
import { RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY } from '@/features/activites/action/rechercher-les-lieux-des-activites.key'
import { statistiquesDuPerimetre } from '@/features/activites/implementations/prisma/statistiques/statistiques-du-perimetre.query'
import {
  nombreDAccompagnements,
  source,
  sourceOptionnelle,
  statistiquesAvec,
} from '@/features/activites/implementations/prisma/statistiques/statistiques-en-cours.query'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre.query'
import { criteresDesStatistiquesDesFiltres } from '@/features/activites/ui/filtres/activites.filtre'
import { filtresDesStatistiques } from '@/features/activites/ui/filtres/statistiques.filtre'
import { barreDesStatistiquesAvec } from '@/features/activites/ui/presenters/barre-des-statistiques.presenter'
import { BarreDesStatistiques } from '@/features/activites/ui/slots/BarreDesStatistiques.slot'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { listerLesMembresAFiltrer } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/domain/lister-les-membres-a-filtrer'
import {
  lireLeDemandeur,
  lireLesMembresAFiltrer,
} from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/prisma/membres-a-filtrer.query'
import { demandeurDuFiltre } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/session/demandeur-du-filtre.query'
import { optionDeMembre } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/ui/presenters/options-de-membres.presenter'
import { consulterMesLiensDePartage } from '@/features/mediateurs/abilities/consulter-mes-liens-de-partage/implementations/prisma/consulter-mes-liens-de-partage.query'
import { REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.key'
import { PartageStatistiques } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/ui/slots/PartageStatistiques.slot'
import { CoordinateurId, MediateurId } from '@/features/mediateurs/domain'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { MesStatistiquesPage } from '@/features/statistiques/abilities/consulter-mes-statistiques/ui/pages/MesStatistiquesPage'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/slots/SectionsDesStatistiques.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

const optionsDesMembres = async (
  user: Parameters<typeof demandeurDuFiltre>[0],
) => {
  const membres = await listerLesMembresAFiltrer({
    lireLeDemandeur,
    lireLesMembresAFiltrer,
  })({ ...demandeurDuFiltre(user), recherche: null })
  return membres.success ? membres.data.map(optionDeMembre) : []
}

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

export const metadata: Metadata = {
  title: metadataTitle('Mes statistiques'),
}
const Page = async (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const parametres = await props.searchParams
  const user = await authenticateMediateurOrCoordinateur()
  const perimetre = perimetreDeLUtilisateur(user)
  if (perimetre === null) {
    throw new Error('Statistiques sans profil médiateur ni coordinateur')
  }

  const valeurs = filtresDesStatistiques.charger(parametres)
  const statistiques = statistiquesDuPerimetre(
    statistiquesDesActivites.lancer,
    rendezVousAuxStatutsSql,
  )({
    perimetre,
    criteres: criteresDesStatistiquesDesFiltres(valeurs),
    fin: valeurs.au ?? new Date(),
  })
  const toutes = statistiquesDesActivites.toutes(statistiques)

  const [{ hasCrasV1 }, liensDePartage, activitesDuPerimetre] =
    await Promise.all([
      statistiques.hasCrasV1,
      consulterMesLiensDePartage({
        mediateurId: user.mediateur?.id ? MediateurId(user.mediateur.id) : null,
        coordinateurId: user.coordinateur?.id
          ? CoordinateurId(user.coordinateur.id)
          : null,
      }),
      decrireLesActivitesDuPerimetre(perimetre),
    ])

  const barre = await barreDesStatistiquesAvec({
    lieux: (choisis) =>
      lieuxDuFiltre(perimetre, choisis).then(lieuxDuFiltrePresentes),
    tagsSuggeres: () => tagsLesPlusUtilisesDuPerimetre(perimetre),
    tagsChoisis,
    employeuses: async () =>
      employeusesEnOptions(activitesDuPerimetre.employeuses),
    mediateurs: async () => optionsDesMembres(user),
  })({ chemin: '/coop/mes-statistiques', parametres }, valeurs)

  const jour = (date: Date | null) => date?.toISOString().slice(0, 10)

  return (
    <ClientBinder
      bind={RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY}
      to={rechercherEmployeusesDesActivitesAction}
    >
      <ClientBinder
        bind={RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY}
        to={rechercherLesLieuxDeMesStatistiquesAction}
      >
        <ClientBinder
          bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
          to={rechercherDesTagsAction}
        >
          <ClientBinder
            bind={RECHERCHER_DES_MEDIATEURS_DES_ACTIVITES_KEY}
            to={rechercherDesMembresAction}
          >
            <ClientBinder
              bind={REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY}
              to={reglerLePartageStatistiquesAction}
            >
              <MesStatistiquesPage
                barreDeFiltres={(actions) => (
                  <BarreDesStatistiques
                    barre={barre}
                    periode={{
                      debut: activitesDuPerimetre.premiere
                        ? new Date(activitesDuPerimetre.premiere)
                        : undefined,
                      fin: activitesDuPerimetre.derniere
                        ? new Date(activitesDuPerimetre.derniere)
                        : undefined,
                    }}
                    coordinateur={user.coordinateur?.id != null}
                    importsV1={hasCrasV1}
                    actions={actions}
                  />
                )}
                filtres={barre.filtres}
                user={user}
                hasCrasV1={hasCrasV1}
                accompagnementsCount={nombreDAccompagnements(toutes)}
                partage={<PartageStatistiques liens={liensDePartage} />}
                impression={impressionDesStatistiques({
                  libelles: barre.filtres.libelles,
                  imprimees: (fournies) => ({
                    generale: {
                      chiffresCles: (
                        <ChiffresClesImprimes
                          totalCounts={fournies.totalCounts}
                        />
                      ),
                      graphiques: (
                        <GraphiquesImprimes
                          accompagnementsParJour={
                            fournies.accompagnementsParJour
                          }
                          accompagnementsParMois={
                            fournies.accompagnementsParMois
                          }
                        />
                      ),
                    },
                    beneficiaires: {
                      profil: (
                        <ProfilImprime beneficiaires={fournies.beneficiaires} />
                      ),
                      communes: (
                        <CommunesDeResidenceImprimees
                          communes={fournies.beneficiaires.communes}
                          total={fournies.beneficiaires.total}
                        />
                      ),
                    },
                    activites: {
                      types: (
                        <TypesDActiviteImprimes
                          typeActivites={fournies.activites.typeActivites}
                          participations={
                            fournies.totalCounts.accompagnements.collectifs
                              .total
                          }
                        />
                      ),
                      thematiques: (
                        <BlocDesThematiques
                          repartition={fournies.activites}
                          pourImpression
                        />
                      ),
                      demarches: (
                        <BlocDesDemarches
                          repartition={fournies.activites}
                          pourImpression
                        />
                      ),
                      tags: (
                        <BlocDesTags
                          tags={fournies.activites.tags}
                          pourImpression
                        />
                      ),
                      materiels: (
                        <MaterielsImprimes
                          materiels={fournies.activites.materiels}
                        />
                      ),
                      canaux: (
                        <CanauxImprimes
                          typeLieu={fournies.activites.typeLieu}
                        />
                      ),
                      durees: (
                        <DureesImprimees durees={fournies.activites.durees} />
                      ),
                      lieux: <LieuxImprimes structures={fournies.structures} />,
                    },
                  }),
                  statistiques: toutes,
                })}
                generale={sectionGenerale({
                  chiffresCles: (
                    <BlocDesChiffresCles
                      totaux={statistiques.totalCounts}
                      debut={jour(valeurs.du)}
                      fin={jour(valeurs.au)}
                    />
                  ),
                  graphique: <BlocDuGraphique periode={statistiques.periode} />,
                })}
                activites={sectionActivites(
                  {
                    types: (
                      <BlocDesTypesDActivite
                        repartition={statistiques.repartition}
                        totaux={statistiques.totalCounts}
                      />
                    ),
                    thematiques: (
                      <BlocDesThematiques
                        repartition={statistiques.repartition}
                      />
                    ),
                    demarches: (
                      <BlocDesDemarches
                        repartition={statistiques.repartition}
                      />
                    ),
                    tags: <BlocDesTags tags={statistiques.tags} />,
                    materiels: (
                      <BlocDesMateriels
                        repartition={statistiques.repartition}
                      />
                    ),
                    canauxEtDurees: (
                      <BlocDesCanauxEtDurees
                        repartition={statistiques.repartition}
                      />
                    ),
                    lieux: (
                      <BlocDesLieux structures={statistiques.structures} />
                    ),
                    communes: (
                      <BlocDesCommunes communes={statistiques.communes} />
                    ),
                  },
                  {
                    canManageTags: true,
                  },
                )}
                beneficiaires={sectionBeneficiaires({
                  profil: <BlocDuProfil profil={statistiques.profil} />,
                  communes: (
                    <BlocDesCommunesDeResidence
                      residences={statistiques.residences}
                    />
                  ),
                })}
              />
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
