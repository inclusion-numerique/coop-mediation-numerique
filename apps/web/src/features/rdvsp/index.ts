/**
 * API publique de la feature RDV Service Public.
 *
 * Ce baril est **serveur** : il n'expose ni composant React ni implémentation
 * Prisma. L'adaptateur HTTP (`implementation/api`) s'importe explicitement par
 * son chemin, pour qu'aucun consommateur client ne l'embarque par inadvertance —
 * `tsc` ne verrait pas la fuite, seuls le build de production et la suite BDD la
 * révéleraient.
 */
export {
  type Agent,
  ApiIndisponible,
  CompteNonLie,
  type CompteRdv,
  type CompteRdvDeconnecte,
  type CompteRdvEnErreur,
  type CompteRdvLie,
  type CompteRdvNonLie,
  type CompteRdvUtilisable,
  type DemandeRdv,
  type DemandeRdvCreee,
  doitAlerterUtilisateur,
  type ErreurRdvApi,
  estAnnule,
  estCollectif,
  estUtilisable,
  type FiltresRdvs,
  type FiltresUsagers,
  JetonRevoque,
  type JetonsOAuth,
  jetonsARenouveler,
  type Motif,
  type Organisation,
  OrganisationId,
  type Participation,
  type Rdv,
  RdvAgentId,
  type RdvCollectif,
  RdvId,
  type RdvIndividuel,
  RdvIntrouvable,
  type RdvServicePublicApi,
  ReponseInattendue,
  StatutPresence,
  StatutPresenceModifiable,
  StatutRdv,
  statutAffiche,
  statutRdv,
  statutsRdv,
  type Usager,
  UsagerId,
  UtilisateurCoopId,
} from './domain'
