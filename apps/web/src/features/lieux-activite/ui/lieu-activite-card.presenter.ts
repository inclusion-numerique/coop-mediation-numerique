import { getCartographieNationaleSourceLabel } from '@app/web/libraries/cartographie-nationale'
import { pluriel } from '@app/web/libraries/pluriel'
import type { Adresse } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { format, isAfter, isBefore, subDays, subYears } from 'date-fns'
import type { LieuEnListe, ModificationEnListe } from '../domain/lieu-en-liste'
import { nomAffiche } from '../domain/nom-affiche'
import { estPublie } from '../domain/visibilite-cartographie'
import {
  type CartographyStatus,
  getCartographyStatus,
} from './statut-cartographie'

export type MiseAJourAffichee =
  | { readonly _tag: 'TropAncienne'; readonly texte: string }
  | { readonly _tag: 'Recente'; readonly texte: string }

export type CarteDuLieu = {
  readonly nom: string
  readonly adresse: string
  readonly miseAJour: MiseAJourAffichee
  readonly statutCartographie: CartographyStatus
  readonly mediateurs: string
}

const parQui = (modification: ModificationEnListe): string =>
  modification._tag === 'ParUtilisateur'
    ? ` par ${modification.auteur}`
    : modification._tag === 'ParSource'
      ? ` par ${getCartographieNationaleSourceLabel(modification.source)}`
      : ''

const miseAJour = (
  modification: ModificationEnListe,
  maintenant: Date,
): MiseAJourAffichee =>
  isBefore(modification.date, subYears(maintenant, 1))
    ? {
        _tag: 'TropAncienne',
        texte: `Dernière mise à jour il y a plus d’un an${parQui(modification)}`,
      }
    : {
        _tag: 'Recente',
        texte: `Mis à jour le ${format(modification.date, 'dd.MM.yyyy')}${parQui(modification)}`,
      }

const adresse = (adresse: Adresse | null): string =>
  adresse == null
    ? 'Adresse non renseignée'
    : `${adresse.voie}${adresse.complement_adresse ? ` (${adresse.complement_adresse})` : ''}, ${adresse.code_postal} ${adresse.commune}`

const mediateurs = (nombre: number): string =>
  `${nombre} ${pluriel(
    nombre,
    'médiateur numérique référencé',
    'médiateurs numériques référencés',
  )}`

export const carteDuLieu = (
  lieu: LieuEnListe,
  maintenant: Date,
): CarteDuLieu => ({
  nom: nomAffiche(lieu.nom, lieu.nomUsage),
  adresse: adresse(lieu.adresse),
  miseAJour: miseAJour(lieu.derniereModification, maintenant),
  statutCartographie: getCartographyStatus({
    visiblePourCartographieNationale: estPublie(lieu.visibilite),
    structureCartographieNationaleId: lieu.identifiantCartographie,
    hasRecentModification: isAfter(
      lieu.derniereModification.date,
      subDays(maintenant, 1),
    ),
  }),
  mediateurs: mediateurs(lieu.mediateurs),
})
