import type { CodeInsee } from '@/libraries/insee'
import type { NomAffiche } from '@/libraries/nom-affiche'
import type { ActeurId } from './acteur-id'
import type { CoordinateurId } from './coordinateur-id'
import type { Courriel } from './courriel'
import type { Dispositif } from './dispositif'
import type { Effectif } from './effectif'
import type { MediateurId } from './mediateur-id'

export type CoordinateurDeLActeur = {
  readonly acteurId: ActeurId
  readonly nomAffiche: NomAffiche
  readonly communeDeLEmployeuse: CodeInsee | null
}

export type Mediation = {
  readonly mediateurId: MediateurId
  readonly nombreDeLieux: Effectif
  readonly coordinateurs: readonly CoordinateurDeLActeur[]
}

type ProfilMediateur = {
  readonly _tag: 'Mediateur'
  readonly dispositif: Dispositif
  readonly mediation: Mediation
}

type ProfilCoordinateur = {
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
