import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { Telephone } from '@/libraries/telephone'
import type { Dispositif } from './dispositif'
import type { UtilisateurId } from './identifiants/utilisateur-id'
import type { AdresseCourriel } from './identite/adresse-courriel'
import type { Nom } from './identite/nom'
import type { Prenom } from './identite/prenom'
import {
  coordinateurDe,
  mediateurDe,
  type RattachementsDuCompte,
} from './rattachements'

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

/**
 * Dates du contrat le plus récent, séparées car Brevo a un attribut pour chacune.
 * `null` = date absente (CDI, contrat non rompu, aucun contrat) : elle est effacée chez Brevo.
 */
export type DatesDeContrat = {
  readonly fin: Date | null
  readonly rupture: Date | null
}

export const SANS_CONTRAT: DatesDeContrat = { fin: null, rupture: null }

export type InscritDeLaListe = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly telephone: Telephone | null
  readonly rattachements: RattachementsDuCompte
  readonly dispositif: SituationDansLeDispositif
  readonly contrat: DatesDeContrat
}

type RolesBrevo = readonly [RoleBrevo, ...RoleBrevo[]]

export type ContactAImporter = {
  readonly utilisateurId: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly telephone: Telephone | null
  readonly roles: RolesBrevo
  readonly contrat: DatesDeContrat
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
          contrat: inscrit.contrat,
        },
      }
}
