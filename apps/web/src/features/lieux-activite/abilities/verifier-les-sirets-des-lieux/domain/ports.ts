import type { LieuAVerifier, ReponseSirene } from './lieu-a-verifier'

/** Les lieux qui portent un SIRET, celui-ci fût-il erroné. */
export type LireLesLieuxASiret = () => Promise<readonly LieuAVerifier[]>

/** Ce que l'annuaire des entreprises sait de ce numéro. */
export type InterrogerSirene = (siret: string) => Promise<ReponseSirene>

/**
 * Retire d'un lieu un SIRET qui ne le désigne pas, et la date de vérification
 * avec lui : le numéro suivant devra être vérifié à son tour.
 */
export type EffacerLeSiret = (lieu: LieuAVerifier) => Promise<void>

/** Date la confrontation à SIRENE, sans toucher à l'identité du lieu. */
export type MarquerLeSiretVerifie = (lieu: LieuAVerifier) => Promise<void>

/** Où la passe raconte son avancement — un job tourne longtemps et sans témoin. */
export type Journal = (message: string) => void
