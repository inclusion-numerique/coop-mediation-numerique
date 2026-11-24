import { notFound } from 'next/navigation'
import { rechercherLesEmployeusesDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-employeuses-du-partage.action'
import { rechercherLesLieuxDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-lieux-du-partage.action'
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
import { lieuxChoisisAvec } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/lieux-choisis.binding'
import { optionsDesLieuxChoisis } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux.presenter'
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
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre'
import { statistiquesDuPerimetre } from '@/features/activites/implementations/statistiques-du-perimetre.binding'
import {
  nombreDAccompagnements,
  source,
  sourceOptionnelle,
  statistiquesAvec,
} from '@/features/activites/implementations/statistiques-en-cours.binding'
import { vocabulaireDesActivites } from '@/features/activites/ui/labels/libelles/vocabulaire-des-statistiques.labels'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionUserFromId } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/prisma/membres-a-filtrer-du-demandeur.query'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/implementations/prisma/resoudre-un-lien-de-partage.query'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { rdvStatusOptions } from '@/features/rdvsp/ui/presenters/statut-rdv'
import { StatistiquesPartagees } from '@/features/statistiques/abilities/consulter-des-statistiques-partagees/ui/pages/StatistiquesPartagees'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from '@/features/statistiques/action/rechercher-employeuses-des-statistiques.key'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/action/rechercher-les-lieux-des-statistiques.key'
import { utilisateurDuPartage } from '@/features/statistiques/domain/utilisateur-du-partage'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/components/sections-des-statistiques'
import { mesStatistiques } from '@/features/statistiques/ui/presenters/mes-statistiques'
import {
  type ParametresDeLaPage,
  parametresDesStatistiquesPartagees,
} from '@/features/statistiques/ui/presenters/parametres-de-la-page.search-params'
import { FiltreDeLieu } from '@/features/statistiques/ui/slots/FiltreDeLieu.slot'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/session/tags-visibles-du-profil'
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

const sourcesDeMesStatistiques = {
  perimetreDe: perimetreDeLUtilisateur,
  lancer: statistiquesDuPerimetre(
    statistiquesDesActivites.lancer,
    rendezVousAuxStatutsSql,
  ),
  rassembler: statistiquesDesActivites.rassembler,
  lieuxChoisis: lieuxChoisisAvec(optionsDesLieuxChoisis),
  tagsVisibles: tagsVisiblesDuProfil,
  beneficiaires: async () => [],
  membres: membresAFiltrerDuDemandeur,
  activitesDuPerimetre: decrireLesActivitesDuPerimetre,
  vocabulaire: {
    ...vocabulaireDesActivites,
    statutsDeRendezVous: rdvStatusOptions,
  },
}

type PageProps = {
  params: Promise<{
    shareId: string
  }>
  searchParams: Promise<ParametresDeLaPage>
}

const Page = async ({ params, searchParams }: PageProps) => {
  const shareId = (await params).shareId
  const parametres = await searchParams

  const partage = await resoudreUnLienDePartage(shareId)
  if (!partage.success) return notFound()

  const user = utilisateurDuPartage(
    partage.data.proprietaire,
    await getSessionUserFromId(partage.data.utilisateurId),
  )

  const { statistiques, ...mesStatistiquesProps } = await mesStatistiques(
    {
      user,
      profil: profilDeLaSession(user),
      ...parametresDesStatistiquesPartagees(parametres),
    },
    sourcesDeMesStatistiques,
  )
  const toutes = statistiquesDesActivites.toutes(statistiques)
  const { hasCrasV1 } = await statistiques.hasCrasV1

  return (
    <ClientBinder
      bind={RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY}
      to={rechercherLesEmployeusesDuPartageAction.bind(null, shareId)}
    >
      <ClientBinder
        bind={RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY}
        to={rechercherLesLieuxDuPartageAction.bind(null, shareId)}
      >
        <StatistiquesPartagees
          {...mesStatistiquesProps}
          username={user.name ?? ''}
          shareId={shareId}
          hasCrasV1={hasCrasV1}
          accompagnementsCount={nombreDAccompagnements(toutes)}
          filtreDeLieu={<FiltreDeLieu choisis={mesStatistiquesProps} />}
          impression={impressionDesStatistiques({
            ...mesStatistiquesProps,
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
                  <BlocDesTags tags={fournies.activites.tags} pourImpression />
                ),
                materiels: (
                  <MaterielsImprimes materiels={fournies.activites.materiels} />
                ),
                canaux: (
                  <CanauxImprimes typeLieu={fournies.activites.typeLieu} />
                ),
                durees: <DureesImprimees durees={fournies.activites.durees} />,
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
                <BlocDesCanauxEtDurees repartition={statistiques.repartition} />
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
  )
}

export default Page
