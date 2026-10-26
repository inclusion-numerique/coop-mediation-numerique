import type { CodeDepartement } from '@app/web/libraries/departement'
import { defineModel, type Model } from '@app/web/libraries/model'
import type { NomAffiche } from '@app/web/libraries/nom-affiche'
import { z } from 'zod'
import type { MediateurId } from '../../../domain/mediateur-id'
import type { RattachementId } from '../../../domain/rattachement-id'
import type { UserId } from '../../../domain/user-id'
import type { ProfilDuMediateur } from './profil-du-mediateur'

export const Courriel = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('Courriel'),
)

export type Courriel = Model.TypeOf<typeof Courriel>

export const NombreDeLieux = defineModel(
  z.number().int().nonnegative().brand('NombreDeLieux'),
)

export type NombreDeLieux = Model.TypeOf<typeof NombreDeLieux>

export type DerniereActiviteIci =
  | { readonly _tag: 'Jamais' }
  | { readonly _tag: 'Le'; readonly date: Date }

export type CoordinateurDuMediateur = {
  readonly acteurId: UserId
  readonly nomAffiche: NomAffiche
  readonly departement: CodeDepartement
}

export type MediateurDuLieu = {
  readonly rattachementId: RattachementId
  readonly mediateurId: MediateurId
  readonly acteurId: UserId
  readonly nomAffiche: NomAffiche
  readonly courriel: Courriel
  readonly profil: ProfilDuMediateur
  readonly nombreDeLieux: NombreDeLieux
  readonly coordinateurs: readonly CoordinateurDuMediateur[]
  readonly derniereActiviteIci: DerniereActiviteIci
}
