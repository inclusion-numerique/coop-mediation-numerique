import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { rafraichirAccueilRdvAction } from '@/app/_actions/rdvsp/rafraichir-accueil-rdv.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import {
  consulterLAccueil,
  selonLeProfil,
} from '@/features/accueil/abilities/consulter-l-accueil/domain/index'
import { visiteurDe } from '@/features/accueil/abilities/consulter-l-accueil/implementations/session/visiteur.query'
import { AccueilPage } from '@/features/accueil/abilities/consulter-l-accueil/ui/pages/AccueilPage'
import { compterLesActivitesDeCoordination } from '@/features/activites/abilities/compter-les-activites-de-coordination/implementations/prisma/activites-de-coordination.query'
import { activitesDeCoordinationPresentees } from '@/features/activites/abilities/compter-les-activites-de-coordination/ui/presenters/activites-de-coordination.presenter'
import { ActivitesDeCoordination } from '@/features/activites/abilities/compter-les-activites-de-coordination/ui/slots/ActivitesDeCoordination.slot'
import { listerLesDernieresActivites } from '@/features/activites/abilities/lister-les-dernieres-activites/implementations/prisma/dernieres-activites.query'
import { dernieresActivitesPresentees } from '@/features/activites/abilities/lister-les-dernieres-activites/ui/presenters/dernieres-activites.presenter'
import { DernieresActivites } from '@/features/activites/abilities/lister-les-dernieres-activites/ui/slots/DernieresActivites.slot'
import { liensVersMesRendezVous } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/liens-vers-mes-rendez-vous.presenter'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/action/supprimer-une-activite-de-mediation.key'
import { BoutonEnregistrerUneActivite } from '@/features/activites/ui/slots/BoutonEnregistrerUneActivite.slot'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { compterLesMembres } from '@/features/equipe/abilities/lister-les-membres/implementations/prisma/lister-les-membres.query'
import { ResumeDeLEquipe } from '@/features/equipe/abilities/lister-les-membres/ui/slots/ResumeDeLEquipe.slot'
import { RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/action/rafraichir-accueil-rdv.key'
import { blocRdvAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/consulter-rdvs-accueil.binding'
import { RdvIntegrationErreurAlerte } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/ui/slots/RdvIntegrationErreurAlerte.slot'
import RdvsAccueil from '@/features/rdvsp/abilities/consulter-rdvs-accueil/ui/slots/RdvsAccueil.slot'
import { rendezVousLies } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { lienDeConnexionARdvServicePublic } from '@/features/rdvsp/implementations/oauth/rdvsp-oauth-callback.client'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Accueil'),
}

type SectionsDeLAccueil = {
  readonly equipe: ReactNode
  readonly activites: ReactNode
}

const Page = async () => {
  const user = await authenticateMediateurOrCoordinateur()
  const accueil = consulterLAccueil(visiteurDe(user))
  if (accueil === null) notFound()

  const [{ equipe, activites }, rdv] = await Promise.all([
    selonLeProfil<Promise<SectionsDeLAccueil>>(accueil.profil, {
      Coordinateur: async ({ coordinateurId }) => {
        const [membres, activitesDeCoordination] = await Promise.all([
          compterLesMembres({ coordinateurId }),
          compterLesActivitesDeCoordination({ coordinateurId }),
        ])
        return {
          equipe: <ResumeDeLEquipe statistiques={membres} />,
          activites: (
            <ActivitesDeCoordination
              activites={activitesDeCoordinationPresentees(
                activitesDeCoordination,
              )}
            />
          ),
        }
      },
      Mediateur: async ({ mediateurId }) => ({
        equipe: null,
        activites: (
          <DernieresActivites
            activites={dernieresActivitesPresentees(
              await listerLesDernieresActivites({
                mediateurId,
                rendezVousLies,
              }),
              user.timezone,
            )}
          />
        ),
      }),
    }),
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
        <AccueilPage
          accueil={accueil}
          equipe={equipe}
          activites={activites}
          enregistrerUneActivite={<BoutonEnregistrerUneActivite />}
          rendezVous={
            <RdvsAccueil
              widget={rdv.widget}
              user={{ timezone: user.timezone }}
              synchroniserAuChargement={rdv.synchroniserAuChargement}
              liens={liensVersMesRendezVous()}
              alerte={
                <RdvIntegrationErreurAlerte
                  lienDeConnexion={lienDeConnexionARdvServicePublic()}
                />
              }
            />
          }
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
