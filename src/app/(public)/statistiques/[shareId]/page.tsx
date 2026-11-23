import { notFound } from 'next/navigation'
import { rechercherLesEmployeusesDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-employeuses-du-partage.action'
import { rechercherLesLieuxDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-lieux-du-partage.action'
import { totauxDesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/totaux-des-accompagnements.binding'
import { BlocDesChiffresCles } from '@/features/activites/abilities/compter-les-accompagnements/ui/slots/BlocDesChiffresCles.slot'
import { ChiffresClesImprimes } from '@/features/activites/abilities/compter-les-accompagnements/ui/slots/ChiffresClesImprimes.slot'
import { accompagnementsParCommune } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/implementations/accompagnements-par-commune.binding'
import { BlocDesCommunes } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/ui/slots/BlocDesCommunes.slot'
import { accompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/accompagnements-par-lieu.binding'
import { BlocDesLieux } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/slots/BlocDesLieux.slot'
import { LieuxImprimes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/slots/LieuxImprimes.slot'
import { accompagnementsParPeriode } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/implementations/accompagnements-par-periode.binding'
import { BlocDuGraphique } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/slots/BlocDuGraphique.slot'
import { GraphiquesImprimes } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/slots/GraphiquesImprimes.slot'
import { personnesParCommune } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/implementations/personnes-par-commune.binding'
import { BlocDesCommunesDeResidence } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/slots/BlocDesCommunesDeResidence.slot'
import { CommunesDeResidenceImprimees } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/slots/CommunesDeResidenceImprimees.slot'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre/implementations/prisma/activites-du-perimetre.query'
import { profilDesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/profil-des-personnes-accompagnees.binding'
import { BlocDuProfil } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/slots/BlocDuProfil.slot'
import { ProfilImprime } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/slots/ProfilImprime.slot'
import { lieuxChoisisDe } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/lieux-choisis.binding'
import { repartitionDesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/repartition-des-accompagnements.binding'
import { BlocDesCanauxEtDurees } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesCanauxEtDurees.slot'
import { BlocDesDemarches } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesDemarches.slot'
import { BlocDesMateriels } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesMateriels.slot'
import { BlocDesThematiques } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesThematiques.slot'
import { BlocDesTypesDActivite } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/BlocDesTypesDActivite.slot'
import { CanauxImprimes } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/CanauxImprimes.slot'
import { DureesImprimees } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/DureesImprimees.slot'
import { MaterielsImprimes } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/MaterielsImprimes.slot'
import { TypesDActiviteImprimes } from '@/features/activites/abilities/repartir-les-accompagnements/ui/slots/TypesDActiviteImprimes.slot'
import { accompagnementsParTag } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/implementations/accompagnements-par-tag.binding'
import { BlocDesTags } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/slots/BlocDesTags.slot'
import { presenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/presence-de-cras-v1.binding'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre'
import { statistiquesDuPerimetre } from '@/features/activites/implementations/statistiques-du-perimetre.binding'
import {
  nombreDAccompagnements,
  statistiquesAvec,
} from '@/features/activites/implementations/statistiques-en-cours.binding'
import { vocabulaireDesActivites } from '@/features/activites/ui/labels/libelles/vocabulaire-des-statistiques.labels'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionUserFromId } from '@/features/authentification/implementations/session/session-user-from-session-token'
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

const sourcesDeMesStatistiques = {
  perimetreDe: perimetreDeLUtilisateur,
  lancer: statistiquesDuPerimetre(
    statistiquesDesActivites.lancer,
    rendezVousAuxStatutsSql,
  ),
  rassembler: statistiquesDesActivites.rassembler,
  lieuxChoisis: lieuxChoisisDe,
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
