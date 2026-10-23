import {
  NomAffiche,
  nomAffiche as nomAfficheDeLaPersonne,
} from '@app/web/libraries/nom-affiche'
import type { AdresseCourriel } from './adresse-courriel'
import type { Nom } from './nom'
import type { Prenom } from './prenom'

export { NomAffiche }

export type Identite = {
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly nomComplet: NomAffiche | null
  readonly courriel: AdresseCourriel
}

export const nomAffiche = ({
  prenom,
  nom,
  nomComplet,
  courriel,
}: Identite): NomAffiche =>
  nomAfficheDeLaPersonne({ prenom, nom, nomComplet, courriel })
