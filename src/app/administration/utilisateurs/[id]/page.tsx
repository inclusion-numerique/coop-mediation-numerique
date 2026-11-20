import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { annulerUneInvitationAction } from '@/app/_actions/equipe/annuler-une-invitation.action'
import { relancerUneInvitationAction } from '@/app/_actions/equipe/relancer-une-invitation.action'
import { retirerUnMembreAction } from '@/app/_actions/equipe/retirer-un-membre.action'
import { supprimerUnAncienMembreAction } from '@/app/_actions/equipe/supprimer-un-ancien-membre.action'
import { reglerLaVisibiliteCartoAction } from '@/app/_actions/mediateurs/regler-la-visibilite-carto.action'
import { changerLesRolesAction } from '@/app/_actions/utilisateurs/changer-les-roles.action'
import { deconnecterUnUtilisateurAction } from '@/app/_actions/utilisateurs/deconnecter-un-utilisateur.action'
import { supprimerCompteAction } from '@/app/_actions/utilisateurs/supprimer-compte.action'
import { usurperUnUtilisateurAction } from '@/app/_actions/utilisateurs/usurper-un-utilisateur.action'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import { historiqueEmployeusesAffichage } from '@/features/employeuse'
import { HistoriqueDesEmployeuses } from '@/features/employeuse/abilities/consulter-historique-employeuses/ui/HistoriqueDesEmployeuses'
import { consulterHistoriqueEmployeuses } from '@/features/employeuse/server'
import { ANNULER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.key'
import { listerLesMembres } from '@/features/equipe/abilities/lister-les-membres'
import {
  ListeDeLEquipe,
  type ParametresDeLaListe,
  requeteDeLaListe,
} from '@/features/equipe/abilities/lister-les-membres/ui'
import { RELANCER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.key'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.key'
import { CoordinateurId } from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementation/session'
import { ActionsDuMembre } from '@/features/equipe/ui'
import { AvertissementsEtatInscription } from '@/features/inscription/components/AvertissementsEtatInscription'
import { MediateurId, TriDesLieux } from '@/features/lieux-activite'
import { listerLesLieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur'
import { LieuxDActiviteEnAdministration } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/ui'
import { REGLER_LA_VISIBILITE_CARTO_ACTION_KEY } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.key'
import { VisibiliteCartoDuMediateur } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/ui'
import { CHANGER_LES_ROLES_ACTION_KEY } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.key'
import { BoutonChangerLesRoles } from '@/features/utilisateurs/abilities/changer-les-roles/ui'
import {
  type FicheUtilisateur,
  ficheUtilisateur,
} from '@/features/utilisateurs/abilities/consulter-un-utilisateur'
import {
  etatDeLInscription,
  FicheUtilisateurPage,
  rolesModifiables,
} from '@/features/utilisateurs/abilities/consulter-un-utilisateur/ui'
import { DECONNECTER_UN_UTILISATEUR_ACTION_KEY } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/action/deconnecter-un-utilisateur.key'
import { BoutonDeconnecter } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/ui'
import { SUPPRIMER_LE_COMPTE_ACTION_KEY } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.key'
import { BoutonSupprimerLeCompte } from '@/features/utilisateurs/abilities/supprimer-compte/ui'
import { USURPER_UN_UTILISATEUR_ACTION_KEY } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.key'
import { BoutonUsurper } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/ui'
import { coordinateurDe, mediateurDe } from '@/features/utilisateurs/domain'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
    ...requeteDeLaListe(searchParams),
  })

  if (!membres.success) return null

  return (
    <ListeDeLEquipe
      membres={membres.data}
      searchParams={searchParams}
      baseHref={`/administration/utilisateurs/${fiche.id}`}
      exporter={null}
      actions={(ligne) => (
        <ActionsDuMembre ligne={ligne} coordinateurId={coordinateur.id} />
      )}
    />
  )
}

const sectionLieux = async (fiche: FicheUtilisateur): Promise<ReactNode> => {
  const mediateur = mediateurDe(fiche.rattachements)
  if (mediateur === null) return null

  return (
    <LieuxDActiviteEnAdministration
      lieux={
        await listerLesLieuxDuMediateur({
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
                <ClientBinder
                  bind={DECONNECTER_UN_UTILISATEUR_ACTION_KEY}
                  to={deconnecterUnUtilisateurAction}
                >
                  <ClientBinder
                    bind={CHANGER_LES_ROLES_ACTION_KEY}
                    to={changerLesRolesAction}
                  >
                    <ClientBinder
                      bind={USURPER_UN_UTILISATEUR_ACTION_KEY}
                      to={usurperUnUtilisateurAction}
                    >
                      <FicheUtilisateurPage
                        fiche={fiche}
                        sections={{
                          roles: (
                            <BoutonChangerLesRoles
                              utilisateurId={fiche.id}
                              {...rolesModifiables(fiche)}
                            />
                          ),
                          suppression: (
                            <BoutonSupprimerLeCompte
                              utilisateurId={fiche.id}
                              nom={fiche.nomAffiche}
                            />
                          ),
                          avertissements: (
                            <AvertissementsEtatInscription
                              user={etatDeLInscription(fiche)}
                            />
                          ),
                          usurpation: environnementServeur.SUDO_USURPATION ? (
                            <BoutonUsurper
                              utilisateurId={fiche.id}
                              taille="small"
                              className="fr-mr-2v"
                            />
                          ) : null,
                          deconnexion: (
                            <BoutonDeconnecter utilisateurId={fiche.id} />
                          ),
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
                              emplois={historiqueEmployeusesAffichage(
                                employeuses,
                              )}
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
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
