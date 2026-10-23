import type { CodeDepartement } from '@app/web/libraries/departement'
import type { NomAffiche } from '@app/web/libraries/nom-affiche'
import type { ActeurId } from './acteur-id'
import type { CoordinateurId } from './coordinateur-id'
import type { Courriel } from './courriel'
import type { Dispositif } from './dispositif'
import type { Effectif } from './effectif'
import type { MediateurId } from './mediateur-id'

export type CoordinateurDeLActeur = {
  readonly acteurId: ActeurId
  readonly nomAffiche: NomAffiche
  readonly departement: CodeDepartement
}

export type Mediation = {
  readonly mediateurId: MediateurId
  readonly nombreDeLieux: Effectif
  readonly coordinateurs: readonly CoordinateurDeLActeur[]
}

export type ProfilMediateur = {
  readonly _tag: 'Mediateur'
  readonly dispositif: Dispositif
  readonly mediation: Mediation
}

export type ProfilCoordinateur = {
  readonly _tag: 'Coordinateur'
  readonly dispositif: Dispositif
  readonly coordinateurId: CoordinateurId
  readonly mediation: Mediation | null
}

export type ProfilActeur = ProfilMediateur | ProfilCoordinateur

export type Acteur = {
  readonly acteurId: ActeurId
  readonly nomAffiche: NomAffiche
  readonly courriel: Courriel
  readonly profil: ProfilActeur
}
