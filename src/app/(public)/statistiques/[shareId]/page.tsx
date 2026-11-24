import { notFound } from 'next/navigation'
import { rechercherLesEmployeusesDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-employeuses-du-partage.action'
import { rechercherLesLieuxDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-lieux-du-partage.action'
import { rechercherLesTagsDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-tags-du-partage.action'
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
import { presenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/presence-de-cras-v1.binding'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/action/rechercher-employeuses.key'
import { RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY } from '@/features/activites/action/rechercher-les-lieux-des-activites.key'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre.query'
import { statistiquesDuPerimetre } from '@/features/activites/implementations/statistiques-du-perimetre.binding'
import {
  nombreDAccompagnements,
  source,
  sourceOptionnelle,
  statistiquesAvec,
} from '@/features/activites/implementations/statistiques-en-cours.binding'
import { BarreDesStatistiques } from '@/features/activites/ui/components/filtres/BarreDesStatistiques'
import { criteresDesStatistiquesDesFiltres } from '@/features/activites/ui/filtres/activites.filtre'
import { filtresDesStatistiques } from '@/features/activites/ui/filtres/statistiques.filtre'
import { barreDesStatistiquesAvec } from '@/features/activites/ui/presenters/barre-des-statistiques.presenter'
import { utilisateurDeLaSessionParId } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/implementations/prisma/resoudre-un-lien-de-partage.query'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { StatistiquesPartageesPage } from '@/features/statistiques/abilities/consulter-des-statistiques-partagees/ui/pages/StatistiquesPartageesPage'
import { utilisateurDuPartage } from '@/features/statistiques/domain/utilisateur-du-partage'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/slots/SectionsDesStatistiques.slot'
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

type PageProps = {
  params: Promise<{
    shareId: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async ({ params, searchParams }: PageProps) => {
  const shareId = (await params).shareId
  const parametres = await searchParams

  const partage = await resoudreUnLienDePartage(shareId)
  if (!partage.success) return notFound()

  const user = utilisateurDuPartage(
    partage.data.proprietaire,
    await utilisateurDeLaSessionParId(partage.data.utilisateurId),
  )

  const perimetre = perimetreDeLUtilisateur(user)
  if (perimetre === null) return notFound()

  const lues = filtresDesStatistiques.charger(parametres)
  const valeurs = { ...lues, au: lues.au ?? new Date() }
  const statistiques = statistiquesDuPerimetre(
    statistiquesDesActivites.lancer,
    rendezVousAuxStatutsSql,
  )({
    perimetre,
    criteres: criteresDesStatistiquesDesFiltres(valeurs),
    fin: valeurs.au,
  })
  const toutes = statistiquesDesActivites.toutes(statistiques)

  const [{ hasCrasV1 }, activitesDuPerimetre] = await Promise.all([
    statistiques.hasCrasV1,
    decrireLesActivitesDuPerimetre(perimetre),
  ])

  const barre = await barreDesStatistiquesAvec({
    lieux: (choisis) =>
      lieuxDuFiltre(perimetre, choisis).then(lieuxDuFiltrePresentes),
    tagsSuggeres: () => tagsLesPlusUtilisesDuPerimetre(perimetre),
    tagsChoisis,
    employeuses: async () =>
      employeusesEnOptions(activitesDuPerimetre.employeuses),
    mediateurs: async () => [],
  })({ chemin: `/statistiques/${shareId}`, parametres }, lues)

  return (
    <ClientBinder
      bind={RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY}
      to={rechercherLesEmployeusesDuPartageAction.bind(null, shareId)}
    >
      <ClientBinder
        bind={RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY}
        to={rechercherLesLieuxDuPartageAction.bind(null, shareId)}
      >
        <ClientBinder
          bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
          to={rechercherLesTagsDuPartageAction.bind(null, shareId)}
        >
          <StatistiquesPartageesPage
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
                coordinateur={false}
                importsV1={hasCrasV1}
                actions={actions}
              />
            )}
            filtres={barre.filtres}
            username={user.name ?? ''}
            shareId={shareId}
            hasCrasV1={hasCrasV1}
            accompagnementsCount={nombreDAccompagnements(toutes)}
            impression={impressionDesStatistiques({
              libelles: barre.filtres.libelles,
              imprimees: (fournies) => ({
                generale: {
                  chiffresCles: (
                    <ChiffresClesImprimes totalCounts={fournies.totalCounts} />
                  ),
                  graphiques: (
                    <GraphiquesImprimes
                      accompagnementsParJour={fournies.accompagnementsParJour}
                      accompagnementsParMois={fournies.accompagnementsParMois}
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
                        fournies.totalCounts.accompagnements.collectifs.total
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
                    <CanauxImprimes typeLieu={fournies.activites.typeLieu} />
                  ),
                  durees: (
                    <DureesImprimees durees={fournies.activites.durees} />
                  ),
                  lieux: <LieuxImprimes structures={fournies.structures} />,
                },
              }),
              statistiques: toutes,
            })}
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
                  <BlocDesCanauxEtDurees
                    repartition={statistiques.repartition}
                  />
                ),
                lieux: <BlocDesLieux structures={statistiques.structures} />,
                communes: <BlocDesCommunes communes={statistiques.communes} />,
              },
              {
                wording: 'generique',
              },
            )}
            beneficiaires={sectionBeneficiaires(
              {
                profil: <BlocDuProfil profil={statistiques.profil} />,
                communes: (
                  <BlocDesCommunesDeResidence
                    residences={statistiques.residences}
                  />
                ),
              },
              {
                wording: 'generique',
              },
            )}
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
