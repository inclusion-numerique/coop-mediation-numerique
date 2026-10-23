import {
  NomAffiche,
  nomAffiche as nomAfficheDeLaPersonne,
} from '@app/web/libraries/nom-affiche'
import type { Email } from './email'
import type { Nom } from './nom'
import type { Prenom } from './prenom'

export { NomAffiche }

export type Identite = {
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly nomComplet: NomAffiche | null
  readonly email: Email
}

export const nomAffiche = ({
  prenom,
  nom,
  nomComplet,
  email,
}: Identite): NomAffiche =>
  nomAfficheDeLaPersonne({ prenom, nom, nomComplet, courriel: email })
