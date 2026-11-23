import { notFound } from 'next/navigation'
import { rechercherLesEmployeusesDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-employeuses-du-partage.action'
import { rechercherLesLieuxDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-lieux-du-partage.action'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre'
import {
  lieuxChoisisDe,
  nombreDAccompagnements,
  perimetreDeLUtilisateur,
  rassembler,
  statistiquesDuPerimetre,
  toutesLesStatistiques,
} from '@/features/activites/implementation/statistiques'
import { vocabulaireDesActivites } from '@/features/activites/ui/libelles/vocabulaire-des-statistiques'
import {
  blocsActivites,
  blocsBeneficiaires,
  blocsGeneraux,
  blocsImprimes,
} from '@/features/activites/ui/statistiques/blocs-des-statistiques'
import { profilDeLaSession } from '@/features/authentification'
import { getSessionUserFromId } from '@/features/authentification/implementation/session/getSessionUserFromSessionToken'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { rdvStatusOptions } from '@/features/rdvsp/ui/rdv-status'
import { mesStatistiques } from '@/features/statistiques/implementation/mes-statistiques'
import { utilisateurDuPartage } from '@/features/statistiques/implementation/utilisateur-du-partage'
import { FiltreDeLieu } from '@/features/statistiques/ui/filtres/FiltreDeLieu'
import {
  type ParametresDeLaPage,
  parametresDesStatistiquesPartagees,
} from '@/features/statistiques/ui/filtres/parametres-de-la-page'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from '@/features/statistiques/ui/filtres/plus-de-filtres/rechercher-employeuses-des-statistiques.key'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/ui/filtres/rechercher-les-lieux-des-statistiques.key'
import { StatistiquesPartagees } from '@/features/statistiques/ui/pages/StatistiquesPartagees'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/sections/sections-des-statistiques'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

const sourcesDeMesStatistiques = {
  perimetreDe: perimetreDeLUtilisateur,
  lancer: statistiquesDuPerimetre(rendezVousAuxStatutsSql),
  rassembler,
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
  const toutes = toutesLesStatistiques(statistiques)
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
            imprimees: blocsImprimes,
            statistiques: toutes,
          })}
          generale={sectionGenerale(blocsGeneraux(statistiques), {
            wording: 'generique',
          })}
          activites={sectionActivites(blocsActivites(statistiques), {
            wording: 'generique',
          })}
          beneficiaires={sectionBeneficiaires(
            blocsBeneficiaires(statistiques),
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
