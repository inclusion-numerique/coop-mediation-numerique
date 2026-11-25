import { Sort } from '@arckit/resultset'
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
import { metadataTitle } from '@/configuration/projet'
import { compterLesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/prisma/totaux-des-accompagnements.query'
import { totauxPresentes } from '@/features/activites/abilities/compter-les-accompagnements/ui/presenters/totaux.presenter'
import { compterLesAccompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/prisma/accompagnements-par-lieu.query'
import { parLieuPresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/presenters/par-lieu.presenter'
import { CoordinateurId as CoordinateurDesActivitesDeCoordination } from '@/features/activites/abilities/compter-les-activites-de-coordination/domain/index'
import { compterLesActivitesDeCoordination } from '@/features/activites/abilities/compter-les-activites-de-coordination/implementations/prisma/activites-de-coordination.query'
import { activitesDeCoordinationPresentees } from '@/features/activites/abilities/compter-les-activites-de-coordination/ui/presenters/activites-de-coordination.presenter'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre/implementations/prisma/activites-du-perimetre.query'
import { decrireLesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/prisma/profil-des-personnes-accompagnees.query'
import { profilPresente } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/presenters/profil.presenter'
import { repartirLesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/prisma/repartition-des-accompagnements.query'
import { repartitionPresentee } from '@/features/activites/abilities/repartir-les-accompagnements/ui/presenters/repartition.presenter'
import { criteresSurLaPeriode, Jour } from '@/features/activites/domain'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre.query'
import { utilisateurDeLaSessionParId } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import {
  authenticateAdmin,
  authenticateUser,
} from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { consulterHistoriqueEmployeuses } from '@/features/employeuse/abilities/consulter-historique-employeuses/implementations/prisma/consulter-historique-employeuses.query'
import { historiqueEmployeusesAffichage } from '@/features/employeuse/abilities/consulter-historique-employeuses/ui/presenters/historique-employeuses.presenter'
import { HistoriqueDesEmployeuses } from '@/features/employeuse/abilities/consulter-historique-employeuses/ui/slots/HistoriqueDesEmployeuses.slot'
import { listerLesMembres } from '@/features/equipe/abilities/lister-les-membres/implementations/prisma/lister-les-membres.query'
import { ListeDeLEquipe } from '@/features/equipe/abilities/lister-les-membres/ui/components/ListeDeLEquipe'
import {
  type ParametresDeLaListe,
  requeteDeLaListe,
} from '@/features/equipe/abilities/lister-les-membres/ui/filtres/liste-de-l-equipe.filtre'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { default as BoutonRetirerUnMembre } from '@/features/equipe/abilities/retirer-un-membre/ui/slots/BoutonRetirerUnMembre.slot'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.key'
import { default as BoutonSupprimerUnAncienMembre } from '@/features/equipe/abilities/supprimer-un-ancien-membre/ui/slots/BoutonSupprimerUnAncienMembre.slot'
import { ANNULER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/action/annuler-une-invitation.key'
import { RELANCER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/action/relancer-une-invitation.key'
import { CoordinateurId } from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { default as ActionsDuMembre } from '@/features/equipe/ui/slots/ActionsDuMembre.slot'
import { AvertissementsEtatInscription } from '@/features/inscription/ui/slots/AvertissementsEtatInscription.slot'
import { listerLesLieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/implementations/prisma/lister-les-lieux-du-mediateur.query'
import { LieuxDActiviteEnAdministration } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/ui/slots/LieuxDActiviteEnAdministration.slot'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { REGLER_LA_VISIBILITE_CARTO_ACTION_KEY } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.key'
import { VisibiliteCartoDuMediateur } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/ui/slots/VisibiliteCartoDuMediateur.slot'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import {
  type PeriodeChoisie,
  periodeChoisieDans,
} from '@/features/statistiques/ui/presenters/statistiques-en-administration.presenter'
import { StatistiquesEnAdministration } from '@/features/statistiques/ui/slots/StatistiquesEnAdministration.slot'
import { CHANGER_LES_ROLES_ACTION_KEY } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.key'
import { BoutonChangerLesRoles } from '@/features/utilisateurs/abilities/changer-les-roles/ui/slots/BoutonChangerLesRoles.slot'
import { type FicheUtilisateur } from '@/features/utilisateurs/abilities/consulter-un-utilisateur/domain/index'
import { ficheUtilisateur } from '@/features/utilisateurs/abilities/consulter-un-utilisateur/implementations/prisma/fiche-utilisateur.query'
import { FicheUtilisateurPage } from '@/features/utilisateurs/abilities/consulter-un-utilisateur/ui/pages/FicheUtilisateurPage'
import {
  etatDeLInscription,
  rolesModifiables,
} from '@/features/utilisateurs/abilities/consulter-un-utilisateur/ui/presenters/fiche-utilisateur.presenter'
import { DECONNECTER_UN_UTILISATEUR_ACTION_KEY } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/action/deconnecter-un-utilisateur.key'
import { BoutonDeconnecter } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/ui/slots/BoutonDeconnecter.slot'
import { SUPPRIMER_LE_COMPTE_ACTION_KEY } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.key'
import { BoutonSupprimerLeCompte } from '@/features/utilisateurs/abilities/supprimer-compte/ui/slots/BoutonSupprimerLeCompte.slot'
import { USURPER_UN_UTILISATEUR_ACTION_KEY } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.key'
import { BoutonUsurper } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/ui/components/BoutonUsurper'
import { coordinateurDe, mediateurDe } from '@/features/utilisateurs/domain'
import { ClientBinder } from '@/libraries/nextjs/injection'

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
        <ActionsDuMembre
          ligne={ligne}
          coordinateurId={coordinateur.id}
          retirer={(membre) => <BoutonRetirerUnMembre {...membre} />}
          supprimer={(ancienMembre) => (
            <BoutonSupprimerUnAncienMembre {...ancienMembre} />
          )}
        />
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
          tri: Sort('nom', 'asc'),
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
    await utilisateurDeLaSessionParId(fiche.id),
  )
  if (perimetre === null) return null

  const coordinateur = coordinateurDe(fiche.rattachements)
  const demande = {
    perimetre,
    criteres: criteresSurLaPeriode({
      du: periode.du === undefined ? null : Jour.safe(periode.du),
      au: periode.au === undefined ? null : Jour.safe(periode.au),
    }),
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
                          usurpation: environnementServeur().SUDO_USURPATION ? (
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
