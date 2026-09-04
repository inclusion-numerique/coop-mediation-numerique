/**
 * Vérifier les SIRET que portent les lieux d'activité.
 *
 * Le SIRET d'un lieu vient d'ailleurs — d'un import, d'une saisie, de la
 * cartographie nationale — et rien ne garantit qu'il désigne l'établissement
 * qu'on croit. Cette ability confronte chaque numéro à l'annuaire des
 * entreprises et retire ceux qui ne tiennent pas.
 *
 * Elle est déclenchée par le job `normalize-sirets`, pas par une route.
 */
export {
  type PortsDeVerification,
  verifierLesSiretsDesLieux,
} from './commands/verifier-les-sirets-des-lieux'
export type {
  Compte,
  EffacerLeSiret,
  InterrogerSirene,
  Journal,
  LieuAVerifier,
  LireLesLieuxASiret,
  MarquerLeSiretVerifie,
  ReponseSirene,
  Verdict,
} from './domain'
export {
  effacerLeSiret,
  interrogerSirene,
  lireLesLieuxASiret,
  marquerLeSiretVerifie,
  sansEcriture,
} from './implementation'
