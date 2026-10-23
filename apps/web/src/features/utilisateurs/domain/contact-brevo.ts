import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { AdresseCourriel } from './adresse-courriel'
import type { Dispositif } from './dispositif'
import type { Nom } from './nom'
import type { Prenom } from './prenom'
import {
  coordinateurDe,
  mediateurDe,
  type RattachementsDuCompte,
} from './rattachements'
import type { Telephone } from './telephone'
import type { UtilisateurId } from './utilisateur-id'

export const RoleBrevo = defineModel(
  z
    .enum(['Mediateur', 'ConseillerNumerique', 'Coordinateur'])
    .brand('RoleBrevo'),
)

export type RoleBrevo = Model.TypeOf<typeof RoleBrevo>

export const SituationDansLeDispositif = defineModel(
  z
    .enum(['HorsDispositif', 'ConseillerNumerique', 'CoordinateurDuDispositif'])
    .brand('SituationDansLeDispositif'),
)

export type SituationDansLeDispositif = Model.TypeOf<
  typeof SituationDansLeDispositif
>

export const situationDansLeDispositif = (
  dispositif: Dispositif,
  coordinateurDeclare: boolean,
): SituationDansLeDispositif =>
  SituationDansLeDispositif(
    dispositif === 'HorsDispositif'
      ? 'HorsDispositif'
      : coordinateurDeclare
        ? 'CoordinateurDuDispositif'
        : 'ConseillerNumerique',
  )

export type InscritDeLaListe = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly telephone: Telephone | null
  readonly rattachements: RattachementsDuCompte
  readonly dispositif: SituationDansLeDispositif
}

export type RolesBrevo = readonly [RoleBrevo, ...RoleBrevo[]]

export type ContactAImporter = {
  readonly utilisateurId: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly telephone: Telephone | null
  readonly roles: RolesBrevo
}

export type ContactASynchroniser =
  | { readonly _tag: 'AImporter'; readonly contact: ContactAImporter }
  | { readonly _tag: 'ARetirer'; readonly courriel: AdresseCourriel }

type Tenue = Pick<InscritDeLaListe, 'rattachements' | 'dispositif'>

const reglesDesRoles: readonly {
  readonly role: RoleBrevo
  readonly tenu: (inscrit: Tenue) => boolean
}[] = [
  {
    role: RoleBrevo('Mediateur'),
    tenu: ({ rattachements }) => mediateurDe(rattachements) !== null,
  },
  {
    role: RoleBrevo('ConseillerNumerique'),
    tenu: ({ dispositif }) => dispositif !== 'HorsDispositif',
  },
  {
    role: RoleBrevo('Coordinateur'),
    tenu: ({ rattachements, dispositif }) =>
      coordinateurDe(rattachements) !== null ||
      dispositif === 'CoordinateurDuDispositif',
  },
]

export const rolesBrevoDe = (inscrit: Tenue): readonly RoleBrevo[] =>
  reglesDesRoles.filter(({ tenu }) => tenu(inscrit)).map(({ role }) => role)

export const contactASynchroniser = (
  inscrit: InscritDeLaListe,
): ContactASynchroniser => {
  const [premier, ...autres] = rolesBrevoDe(inscrit)

  return premier === undefined
    ? { _tag: 'ARetirer', courriel: inscrit.courriel }
    : {
        _tag: 'AImporter',
        contact: {
          utilisateurId: inscrit.id,
          courriel: inscrit.courriel,
          prenom: inscrit.prenom,
          nom: inscrit.nom,
          telephone: inscrit.telephone,
          roles: [premier, ...autres],
        },
      }
}
