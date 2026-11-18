import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { rafraichirAccueilRdvAction } from '@/app/_actions/rdvsp/rafraichir-accueil-rdv.action'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@/auth/authenticateUser'
import {
  consulterLAccueil,
  type ProfilDAccueil,
  visiteurDe,
} from '@/features/accueil/abilities/consulter-l-accueil'
import { Accueil } from '@/features/accueil/abilities/consulter-l-accueil/ui'
import { compterLesActivitesDeCoordination } from '@/features/activites/abilities/compter-les-activites-de-coordination'
import {
  ActivitesDeCoordination,
  activitesDeCoordinationPresentees,
} from '@/features/activites/abilities/compter-les-activites-de-coordination/ui'
import { listerLesDernieresActivites } from '@/features/activites/abilities/lister-les-dernieres-activites'
import {
  DernieresActivites,
  dernieresActivitesPresentees,
} from '@/features/activites/abilities/lister-les-dernieres-activites/ui'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/ui/detail/supprimer-une-activite-de-mediation.key'
import { BoutonEnregistrerUneActivite } from '@/features/activites/ui/saisie/CreateCraModal/BoutonEnregistrerUneActivite'
import { compterLesMembres } from '@/features/equipe'
import { ResumeDeLEquipe } from '@/features/equipe/abilities/lister-les-membres/ui'
import { RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/action/rafraichir-accueil-rdv.key'
import { blocRdvAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/consulter-rdvs-accueil.binding'
import { RdvIntegrationErreurAlerte } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/ui/components/RdvIntegrationErreurAlerte'
import RdvsAccueil from '@/features/rdvsp/abilities/consulter-rdvs-accueil/ui/components/RdvsAccueil'
import { rendezVousLies } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/utilisateur-coop-id'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Accueil'),
}

const sectionEquipe = async (profil: ProfilDAccueil): Promise<ReactNode> =>
  profil._tag === 'Coordinateur' ? (
    <ResumeDeLEquipe
      statistiques={
        await compterLesMembres({
          coordinateurId: profil.coordinateurId,
        })
      }
    />
  ) : null

const sectionActivites = async (
  profil: ProfilDAccueil,
  timezone: string,
): Promise<ReactNode> =>
  profil._tag === 'Coordinateur' ? (
    <ActivitesDeCoordination
      activites={activitesDeCoordinationPresentees(
        await compterLesActivitesDeCoordination({
          coordinateurId: profil.coordinateurId,
        }),
      )}
    />
  ) : (
    <DernieresActivites
      activites={dernieresActivitesPresentees(
        await listerLesDernieresActivites({
          mediateurId: profil.mediateurId,
          rendezVousLies,
        }),
        timezone,
      )}
    />
  )

const Page = async () => {
  const user = await authenticateMediateurOrCoordinateur()
  const accueil = consulterLAccueil(visiteurDe(user))
  if (accueil === null) notFound()

  const [equipe, activites, rdv] = await Promise.all([
    sectionEquipe(accueil.profil),
    sectionActivites(accueil.profil, user.timezone),
    blocRdvAccueil(UtilisateurCoopId(user.id), new Date()),
  ])

  return (
    <ClientBinder
      bind={RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY}
      to={rafraichirAccueilRdvAction}
    >
      <ClientBinder
        bind={SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY}
        to={supprimerUneActiviteDeMediationAction}
      >
        <Accueil
          accueil={accueil}
          equipe={equipe}
          activites={activites}
          enregistrerUneActivite={<BoutonEnregistrerUneActivite />}
          rendezVous={
            <RdvsAccueil
              widget={rdv.widget}
              user={{ timezone: user.timezone }}
              synchroniserAuChargement={rdv.synchroniserAuChargement}
              alerte={<RdvIntegrationErreurAlerte />}
            />
          }
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
