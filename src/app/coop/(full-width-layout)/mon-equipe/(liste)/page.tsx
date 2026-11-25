import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { annulerUneInvitationAction } from '@/app/_actions/equipe/annuler-une-invitation.action'
import { relancerUneInvitationAction } from '@/app/_actions/equipe/relancer-une-invitation.action'
import { retirerUnMembreAction } from '@/app/_actions/equipe/retirer-un-membre.action'
import { supprimerUnAncienMembreAction } from '@/app/_actions/equipe/supprimer-un-ancien-membre.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { default as BoutonExporter } from '@/features/equipe/abilities/exporter-les-membres/ui/slots/BoutonExporter.slot'
import { default as BoutonInviterUnePersonne } from '@/features/equipe/abilities/inviter-des-membres/ui/slots/BoutonInviterUnePersonne.slot'
import { listerLesMembres } from '@/features/equipe/abilities/lister-les-membres/implementations/prisma/lister-les-membres.query'
import {
  type ParametresDeLaListe,
  requeteDeLaListe,
} from '@/features/equipe/abilities/lister-les-membres/ui/filtres/liste-de-l-equipe.filtre'
import { default as EquipeListePage } from '@/features/equipe/abilities/lister-les-membres/ui/pages/EquipeListePage'
import { ListeDeLEquipe } from '@/features/equipe/abilities/lister-les-membres/ui/slots/ListeDeLEquipe.slot'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { default as BoutonRetirerUnMembre } from '@/features/equipe/abilities/retirer-un-membre/ui/slots/BoutonRetirerUnMembre.slot'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.key'
import { default as BoutonSupprimerUnAncienMembre } from '@/features/equipe/abilities/supprimer-un-ancien-membre/ui/slots/BoutonSupprimerUnAncienMembre.slot'
import { ANNULER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/action/annuler-une-invitation.key'
import { RELANCER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/action/relancer-une-invitation.key'
import { CoordinateurId } from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { default as ActionsDuMembre } from '@/features/equipe/ui/slots/ActionsDuMembre.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

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
              enTete={<BoutonInviterUnePersonne />}
              liste={
                <ListeDeLEquipe
                  membres={membres.data}
                  searchParams={searchParams}
                  baseHref="/coop/mon-equipe"
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
                      retirer={(membre) => (
                        <BoutonRetirerUnMembre {...membre} />
                      )}
                      supprimer={(ancienMembre) => (
                        <BoutonSupprimerUnAncienMembre {...ancienMembre} />
                      )}
                    />
                  )}
                />
              }
            />
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
