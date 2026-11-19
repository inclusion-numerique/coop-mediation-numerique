import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { annulerUneInvitationAction } from '@/app/_actions/equipe/annuler-une-invitation.action'
import { relancerUneInvitationAction } from '@/app/_actions/equipe/relancer-une-invitation.action'
import { retirerUnMembreAction } from '@/app/_actions/equipe/retirer-un-membre.action'
import { supprimerUnAncienMembreAction } from '@/app/_actions/equipe/supprimer-un-ancien-membre.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateCoordinateur } from '@/features/authentification/implementation/session/authenticateUser'
import { ANNULER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.key'
import { BoutonExporter } from '@/features/equipe/abilities/exporter-les-membres/ui'
import { BoutonInviterUnePersonne } from '@/features/equipe/abilities/inviter-des-membres/ui'
import { listerLesMembres } from '@/features/equipe/abilities/lister-les-membres'
import {
  EquipeListePage,
  type ParametresDeLaListe,
  requeteDeLaListe,
} from '@/features/equipe/abilities/lister-les-membres/ui'
import { RELANCER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.key'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.key'
import { CoordinateurId } from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementation/session'
import { ActionsDuMembre } from '@/features/equipe/ui'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Mon équipe'),
}

const Page = async (props: { searchParams: Promise<ParametresDeLaListe> }) => {
  const searchParams = await props.searchParams
  const user = await authenticateCoordinateur()
  const coordinateurId = user.coordinateur.id

  const membres = await listerLesMembres({
    coordinateurId: CoordinateurId(coordinateurId),
    lecteur: {
      gestionnaire: gestionnaireDe(user),
      membreActifDeLEquipe: false,
    },
    ...requeteDeLaListe(searchParams),
  })

  if (!membres.success) redirect('/coop')

  return (
    <ClientBinder
      bind={ANNULER_UNE_INVITATION_ACTION_KEY}
      to={annulerUneInvitationAction}
    >
      <ClientBinder
        bind={RELANCER_UNE_INVITATION_ACTION_KEY}
        to={relancerUneInvitationAction}
      >
        <ClientBinder
          bind={RETIRER_UN_MEMBRE_ACTION_KEY}
          to={retirerUnMembreAction}
        >
          <ClientBinder
            bind={SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY}
            to={supprimerUnAncienMembreAction}
          >
            <EquipeListePage
              membres={membres.data}
              searchParams={searchParams}
              baseHref="/coop/mon-equipe"
              enTete={<BoutonInviterUnePersonne />}
              exporter={
                <BoutonExporter
                  coordinateurId={coordinateurId}
                  parametres={searchParams}
                />
              }
              actions={(ligne) => (
                <ActionsDuMembre
                  ligne={ligne}
                  coordinateurId={coordinateurId}
                />
              )}
            />
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
