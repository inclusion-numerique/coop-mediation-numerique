import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'
import { type Identite, type Salutation, salutation } from './salutation'

export type ProfilDAccueil =
  | {
      readonly _tag: 'Coordinateur'
      readonly coordinateurId: CoordinateurId
    }
  | {
      readonly _tag: 'Mediateur'
      readonly mediateurId: MediateurId
      readonly bienvenue: boolean
    }

export type Accueil = {
  readonly salutation: Salutation
  readonly profil: ProfilDAccueil
}

export type Visiteur = Identite & {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
  readonly presentationVue: boolean
}

const profilDe = ({
  coordinateurId,
  mediateurId,
  presentationVue,
}: Visiteur): ProfilDAccueil | null => {
  if (coordinateurId !== null) return { _tag: 'Coordinateur', coordinateurId }
  if (mediateurId !== null)
    return { _tag: 'Mediateur', mediateurId, bienvenue: !presentationVue }
  return null
}

export const consulterLAccueil = (visiteur: Visiteur): Accueil | null => {
  const profil = profilDe(visiteur)
  return profil === null ? null : { salutation: salutation(visiteur), profil }
}
