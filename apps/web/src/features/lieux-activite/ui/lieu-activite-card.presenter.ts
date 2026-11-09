import { nomAffiche } from '@app/web/features/lieux-activite/domain/nom-affiche'
import { getCartographieNationaleSourceLabel } from '@app/web/libraries/cartographie-nationale'
import { pluriel } from '@app/web/libraries/pluriel'
import { format, isAfter, isBefore, subDays, subYears } from 'date-fns'
import {
  type CartographyStatus,
  getCartographyStatus,
} from './statut-cartographie'

export type LieuEnActivite = {
  readonly id: string
  readonly nom: string
  readonly nomUsage: string | null
  readonly adresse: string
  readonly complementAdresse: string | null
  readonly commune: string
  readonly codePostal: string
  readonly modification: Date
  readonly derniereModificationSource: string | null
  readonly visiblePourCartographieNationale: boolean
  readonly structureCartographieNationaleId: string | null
  readonly adresseAPreciser: boolean
  readonly _count: { readonly mediateursEnActivite: number }
}

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

const parQui = (
  lieu: LieuEnActivite,
  derniereModificationPar: string | null,
): string => {
  const auteur =
    derniereModificationPar ??
    (lieu.derniereModificationSource == null
      ? null
      : getCartographieNationaleSourceLabel(lieu.derniereModificationSource))

  return auteur == null ? '' : ` par ${auteur}`
}

const miseAJour = (
  lieu: LieuEnActivite,
  derniereModificationPar: string | null,
  maintenant: Date,
): MiseAJourAffichee =>
  isBefore(lieu.modification, subYears(maintenant, 1))
    ? {
        _tag: 'TropAncienne',
        texte: `Dernière mise à jour il y a plus d’un an${parQui(lieu, derniereModificationPar)}`,
      }
    : {
        _tag: 'Recente',
        texte: `Mis à jour le ${format(lieu.modification, 'dd.MM.yyyy')}${parQui(lieu, derniereModificationPar)}`,
      }

const adresse = ({
  adresse,
  complementAdresse,
  codePostal,
  commune,
}: LieuEnActivite): string =>
  `${adresse}${complementAdresse ? ` (${complementAdresse})` : ''}, ${codePostal} ${commune}`

const mediateurs = ({ _count }: LieuEnActivite): string =>
  `${_count.mediateursEnActivite} ${pluriel(
    _count.mediateursEnActivite,
    'médiateur numérique référencé',
    'médiateurs numériques référencés',
  )}`

export const carteDuLieu = (
  lieu: LieuEnActivite,
  derniereModificationPar: string | null,
  maintenant: Date,
): CarteDuLieu => ({
  nom: nomAffiche(lieu.nom, lieu.nomUsage),
  adresse: adresse(lieu),
  miseAJour: miseAJour(lieu, derniereModificationPar, maintenant),
  statutCartographie: getCartographyStatus({
    visiblePourCartographieNationale: lieu.visiblePourCartographieNationale,
    structureCartographieNationaleId: lieu.structureCartographieNationaleId,
    hasRecentModification: isAfter(lieu.modification, subDays(maintenant, 1)),
  }),
  mediateurs: mediateurs(lieu),
})
