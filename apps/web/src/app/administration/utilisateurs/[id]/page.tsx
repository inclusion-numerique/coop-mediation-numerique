import { annulerUneInvitationAction } from '@app/web/app/_actions/equipe/annuler-une-invitation.action'
import { relancerUneInvitationAction } from '@app/web/app/_actions/equipe/relancer-une-invitation.action'
import { retirerUnMembreAction } from '@app/web/app/_actions/equipe/retirer-un-membre.action'
import { supprimerUnAncienMembreAction } from '@app/web/app/_actions/equipe/supprimer-un-ancien-membre.action'
import { reglerLaVisibiliteCartoAction } from '@app/web/app/_actions/mediateurs/regler-la-visibilite-carto.action'
import { supprimerCompteAction } from '@app/web/app/_actions/utilisateurs/supprimer-compte.action'
import UsurpUserButton from '@app/web/app/administration/usurpation/UsurpUserButton'
import ChangeUserRolesButton from '@app/web/app/administration/utilisateurs/[id]/ChangeUserRolesButton'
import LogoutUserButton from '@app/web/app/administration/utilisateurs/[id]/LogoutUserButton'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { historiqueEmployeusesAffichage } from '@app/web/features/employeuse'
import { HistoriqueDesEmployeuses } from '@app/web/features/employeuse/abilities/consulter-historique-employeuses/ui/HistoriqueDesEmployeuses'
import { consulterHistoriqueEmployeuses } from '@app/web/features/employeuse/server'
import { ANNULER_UNE_INVITATION_ACTION_KEY } from '@app/web/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.key'
import { listerLesMembres } from '@app/web/features/equipe/abilities/lister-les-membres'
import {
  ListeDeLEquipe,
  type ParametresDeLaListe,
} from '@app/web/features/equipe/abilities/lister-les-membres/ui'
import { RELANCER_UNE_INVITATION_ACTION_KEY } from '@app/web/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.key'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.key'
import { CoordinateurId, criteresEquipe } from '@app/web/features/equipe/domain'
import { gestionnaireDe } from '@app/web/features/equipe/implementation/session'
import { ActionsDuMembre } from '@app/web/features/equipe/ui'
import { AvertissementsEtatInscription } from '@app/web/features/inscription/components/AvertissementsEtatInscription'
import { MediateurId, TriDesLieux } from '@app/web/features/lieux-activite'
import { listerMesLieuxActivite } from '@app/web/features/lieux-activite/abilities/lister-mes-lieux-activite'
import { LieuxDActiviteEnAdministration } from '@app/web/features/lieux-activite/abilities/lister-mes-lieux-activite/ui'
import { REGLER_LA_VISIBILITE_CARTO_ACTION_KEY } from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.key'
import { VisibiliteCartoDuMediateur } from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto/ui'
import {
  type FicheUtilisateur,
  ficheUtilisateur,
} from '@app/web/features/utilisateurs/abilities/consulter-un-utilisateur'
import { FicheUtilisateurPage } from '@app/web/features/utilisateurs/abilities/consulter-un-utilisateur/ui'
import { SUPPRIMER_LE_COMPTE_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.key'
import { BoutonSupprimerLeCompte } from '@app/web/features/utilisateurs/abilities/supprimer-compte/ui'
import {
  coordinateurDe,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import Button from '@codegouvfr/react-dsfr/Button'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

export const metadata = {
  title: metadataTitle('Utilisateurs - Détails'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const sectionEquipe = async (
  fiche: FicheUtilisateur,
  searchParams: ParametresDeLaListe,
): Promise<ReactNode> => {
  const coordinateur = coordinateurDe(fiche.rattachements)
  if (coordinateur === null) return null

  const administrateur = await authenticateUser()
  const membres = await listerLesMembres({
    coordinateurId: CoordinateurId(coordinateur.id),
    lecteur: {
      gestionnaire: gestionnaireDe(administrateur),
      membreActifDeLEquipe: false,
    },
    criteres: criteresEquipe(searchParams),
    page: toNumberOr(searchParams.page)(DEFAULT_PAGE),
    lignesParPage: toNumberOr(searchParams.lignes)(DEFAULT_PAGE_SIZE),
  })

  if (!membres.success) return null

  return (
    <>
      <div className="fr-flex fr-mt-8v fr-mb-6v fr-align-items-center fr-justify-content-space-between">
        <h5 className="fr-mb-0">Équipe</h5>
        <Button
          iconId="fr-icon-user-add-line"
          priority="secondary"
          size="small"
          linkProps={{
            href: `/administration/utilisateurs/${fiche.id}/equipe-coordonnee/ajouter`,
          }}
        >
          Ajouter un membre
        </Button>
      </div>
      <ListeDeLEquipe
        membres={membres.data}
        searchParams={searchParams}
        baseHref={`/administration/utilisateurs/${fiche.id}`}
        exporter={null}
        actions={(ligne) => (
          <ActionsDuMembre ligne={ligne} coordinateurId={coordinateur.id} />
        )}
      />
    </>
  )
}

const sectionLieux = async (fiche: FicheUtilisateur): Promise<ReactNode> => {
  const mediateur = mediateurDe(fiche.rattachements)
  if (mediateur === null) return null

  return (
    <LieuxDActiviteEnAdministration
      lieux={
        await listerMesLieuxActivite({
          mediateurId: MediateurId(mediateur.id),
          tri: TriDesLieux(null),
        })
      }
    />
  )
}

const Page = async (props: {
  params: Promise<{ id: string }>
  searchParams: Promise<ParametresDeLaListe>
}) => {
  const [{ id }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])

  const fiche = await ficheUtilisateur({
    utilisateurId: id,
    maintenant: new Date(),
  })
  if (fiche === null) notFound()

  const mediateur = mediateurDe(fiche.rattachements)
  const coordinateur = coordinateurDe(fiche.rattachements)

  const [equipe, lieux, employeuses] = await Promise.all([
    sectionEquipe(fiche, searchParams),
    sectionLieux(fiche),
    consulterHistoriqueEmployeuses({ userId: fiche.id }),
  ])

  return (
    <ClientBinder
      bind={RELANCER_UNE_INVITATION_ACTION_KEY}
      to={relancerUneInvitationAction}
    >
      <ClientBinder
        bind={ANNULER_UNE_INVITATION_ACTION_KEY}
        to={annulerUneInvitationAction}
      >
        <ClientBinder
          bind={RETIRER_UN_MEMBRE_ACTION_KEY}
          to={retirerUnMembreAction}
        >
          <ClientBinder
            bind={SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY}
            to={supprimerUnAncienMembreAction}
          >
            <ClientBinder
              bind={REGLER_LA_VISIBILITE_CARTO_ACTION_KEY}
              to={reglerLaVisibiliteCartoAction}
            >
              <ClientBinder
                bind={SUPPRIMER_LE_COMPTE_ACTION_KEY}
                to={supprimerCompteAction}
              >
                <FicheUtilisateurPage
                  fiche={fiche}
                  sections={{
                    actions: (
                      <div className="fr-flex fr-flex-gap-2v">
                        <ChangeUserRolesButton
                          userId={fiche.id}
                          currentIsMediateur={mediateur !== null}
                          currentIsCoordinateur={coordinateur !== null}
                          canRemoveMediateur={
                            mediateur === null ||
                            (mediateur.beneficiaires === 0 &&
                              mediateur.activites === 0)
                          }
                          canRemoveCoordinateur={
                            coordinateur === null ||
                            coordinateur.mediateursCoordonnes === 0
                          }
                        />
                        {fiche.role === 'User' && fiche.supprimeLe === null && (
                          <BoutonSupprimerLeCompte
                            utilisateurId={fiche.id}
                            nom={fiche.nomAffiche}
                          />
                        )}
                      </div>
                    ),
                    avertissements: (
                      <AvertissementsEtatInscription
                        user={{
                          role: fiche.role,
                          inscriptionValidee: fiche.inscritLe,
                          mediateur:
                            mediateur === null ? null : { id: mediateur.id },
                          coordinateur:
                            coordinateur === null
                              ? null
                              : { id: coordinateur.id },
                        }}
                      />
                    ),
                    outils: (
                      <div>
                        {ServerWebAppConfig.Sudo.usurpation && (
                          <UsurpUserButton
                            userId={fiche.id}
                            size="small"
                            className="fr-mr-2v"
                          />
                        )}
                        <Button
                          iconId="fr-icon-git-merge-line"
                          priority="tertiary"
                          size="small"
                          linkProps={{
                            href: `/administration/utilisateurs/${fiche.id}/merge`,
                          }}
                        >
                          Fusionner avec un autre utilisateur
                        </Button>
                      </div>
                    ),
                    deconnexion: <LogoutUserButton userId={fiche.id} />,
                    visibiliteCarto:
                      mediateur === null ? null : (
                        <VisibiliteCartoDuMediateur
                          mediateurId={mediateur.id}
                          visible={mediateur.visible}
                        />
                      ),
                    equipe,
                    employeuses: (
                      <HistoriqueDesEmployeuses
                        emplois={historiqueEmployeusesAffichage(employeuses)}
                      />
                    ),
                    lieux,
                  }}
                />
              </ClientBinder>
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
