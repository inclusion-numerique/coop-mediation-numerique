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
import { compterLesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements'
import { totauxPresentes } from '@/features/activites/abilities/compter-les-accompagnements/ui'
import { compterLesAccompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu'
import { parLieuPresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui'
import {
  CoordinateurId as CoordinateurDesActivitesDeCoordination,
  compterLesActivitesDeCoordination,
} from '@/features/activites/abilities/compter-les-activites-de-coordination'
import { activitesDeCoordinationPresentees } from '@/features/activites/abilities/compter-les-activites-de-coordination/ui'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre'
import { decrireLesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees'
import { profilPresente } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui'
import { repartirLesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements'
import { repartitionPresentee } from '@/features/activites/abilities/repartir-les-accompagnements/ui'
import { criteresDesStatistiques } from '@/features/activites/domain'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/statistiques'
import {
  authenticateAdmin,
  authenticateUser,
} from '@/features/authentification/implementations/session/authenticateUser'
import { getSessionUserFromId } from '@/features/authentification/implementations/session/getSessionUserFromSessionToken'
import { consulterHistoriqueEmployeuses } from '@/features/employeuse/abilities/consulter-historique-employeuses/implementations'
import { HistoriqueDesEmployeuses } from '@/features/employeuse/abilities/consulter-historique-employeuses/ui/HistoriqueDesEmployeuses'
import { historiqueEmployeusesAffichage } from '@/features/employeuse/abilities/consulter-historique-employeuses/ui/historique-employeuses.presenter'
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
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { ActionsDuMembre } from '@/features/equipe/ui'
import { AvertissementsEtatInscription } from '@/features/inscription/ui/AvertissementsEtatInscription'
import { listerLesLieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur'
import { LieuxDActiviteEnAdministration } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/ui'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { TriDesLieux } from '@/features/lieux-activite/domain/tri-des-lieux'
import { REGLER_LA_VISIBILITE_CARTO_ACTION_KEY } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.key'
import { VisibiliteCartoDuMediateur } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/ui'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import {
  type PeriodeChoisie,
  periodeChoisieDans,
  StatistiquesEnAdministration,
} from '@/features/statistiques/ui/administration'
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

const activitesDeCoordinationEnCumul = async (
  coordinateurId: string | null,
) => {
  if (coordinateurId === null) return null

  const presentees = activitesDeCoordinationPresentees(
    await compterLesActivitesDeCoordination({
      coordinateurId: CoordinateurDesActivitesDeCoordination(coordinateurId),
    }),
  )

  return (
    presentees.periodes.find(({ cle }) => cle === presentees.periodeParDefaut)
      ?.compteurs ?? []
  )
}

const sectionStatistiques = async (
  fiche: FicheUtilisateur,
  periode: PeriodeChoisie,
): Promise<ReactNode> => {
  const perimetre = perimetreDeLUtilisateur(
    await getSessionUserFromId(fiche.id),
  )
  if (perimetre === null) return null

  const coordinateur = coordinateurDe(fiche.rattachements)
  const demande = {
    perimetre,
    criteres: criteresDesStatistiques(periode),
    rendezVousAuxStatuts: rendezVousAuxStatutsSql,
  }

  const [
    totaux,
    repartition,
    profil,
    lieux,
    coordination,
    { premiere, derniere },
  ] = await Promise.all([
    compterLesAccompagnements(demande).then(totauxPresentes),
    repartirLesAccompagnements(demande).then(repartitionPresentee),
    decrireLesPersonnesAccompagnees(demande).then(profilPresente),
    compterLesAccompagnementsParLieu(demande).then(parLieuPresentes),
    activitesDeCoordinationEnCumul(coordinateur?.id ?? null),
    decrireLesActivitesDuPerimetre(perimetre),
  ])

  return (
    <StatistiquesEnAdministration
      utilisateurId={fiche.id}
      coordinateur={coordinateur !== null}
      premiere={premiere}
      derniere={derniere}
      periode={periode}
      statistiques={{ totaux, repartition, profil, lieux, coordination }}
    />
  )
}

const Page = async (props: {
  params: Promise<{ id: string }>
  searchParams: Promise<ParametresDeLaListe & PeriodeChoisie>
}) => {
  await authenticateAdmin()
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

  const [equipe, lieux, employeuses, statistiques] = await Promise.all([
    sectionEquipe(fiche, searchParams),
    sectionLieux(fiche),
    consulterHistoriqueEmployeuses({ userId: fiche.id }),
    sectionStatistiques(fiche, periodeChoisieDans(searchParams)),
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
                          statistiques,
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
