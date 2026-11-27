import type { CodeDepartement, CodeInsee } from '@/libraries/insee'
import type { NomAffiche } from '@/libraries/nom-affiche'
import type { ActeurId } from './acteur-id'
import type { CoordinateurId } from './coordinateur-id'
import type { Courriel } from './courriel'
import type { Dispositif } from './dispositif'
import type { Effectif } from './effectif'
import type { MediateurId } from './mediateur-id'

type IdentiteDuCoordinateur = {
  readonly acteurId: ActeurId
  readonly nomAffiche: NomAffiche
}

export type CoordinateurAvecCommune = IdentiteDuCoordinateur & {
  readonly communeDeLEmployeuse: CodeInsee | null
}

export type CoordinateurDeLActeur = IdentiteDuCoordinateur & {
  readonly departement: CodeDepartement
}

export type Mediation<Coordinateur = CoordinateurDeLActeur> = {
  readonly mediateurId: MediateurId
  readonly nombreDeLieux: Effectif
  readonly coordinateurs: readonly Coordinateur[]
}

export type MediationAvecCommunes = Mediation<CoordinateurAvecCommune>

type ProfilMediateur<Coordinateur> = {
  readonly _tag: 'Mediateur'
  readonly dispositif: Dispositif
  readonly mediation: Mediation<Coordinateur>
}

type ProfilCoordinateur<Coordinateur> = {
  readonly _tag: 'Coordinateur'
  readonly dispositif: Dispositif
  readonly coordinateurId: CoordinateurId
  readonly mediation: Mediation<Coordinateur> | null
}

export type ProfilActeur<Coordinateur = CoordinateurDeLActeur> =
  | ProfilMediateur<Coordinateur>
  | ProfilCoordinateur<Coordinateur>

export type Acteur<Coordinateur = CoordinateurDeLActeur> = {
  readonly acteurId: ActeurId
  readonly nomAffiche: NomAffiche
  readonly courriel: Courriel
  readonly profil: ProfilActeur<Coordinateur>
}

export type ActeurAvecCommunes = Acteur<CoordinateurAvecCommune>
