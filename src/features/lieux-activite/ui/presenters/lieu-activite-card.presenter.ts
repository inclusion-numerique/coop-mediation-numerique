import type { Adresse } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { format } from 'date-fns/format'
import { isAfter } from 'date-fns/isAfter'
import { isBefore } from 'date-fns/isBefore'
import { subDays } from 'date-fns/subDays'
import { subYears } from 'date-fns/subYears'
import { libelleDeLaSource } from '@/features/lieux-activite/domain/cartographie-nationale/sources'
import { pluriel } from '@/libraries/pluriel'
import { estPublie } from '../../domain/cartographie-nationale/visibilite-cartographie'
import type {
  LieuEnListe,
  ModificationEnListe,
} from '../../domain/lieu-en-liste'
import { nomAffiche } from '../../domain/nom-affiche'
import {
  type StatutCartographie,
  statutCartographie,
} from './statut-cartographie.presenter'

export type MiseAJourAffichee =
  | { readonly _tag: 'TropAncienne'; readonly texte: string }
  | { readonly _tag: 'Recente'; readonly texte: string }

export type CarteDuLieu = {
  readonly nom: string
  readonly adresse: string
  readonly miseAJour: MiseAJourAffichee
  readonly statutCartographie: StatutCartographie
  readonly mediateurs: string
}

const parQui = (modification: ModificationEnListe): string =>
  modification._tag === 'ParUtilisateur'
    ? ` par ${modification.auteur}`
    : modification._tag === 'ParSource'
      ? ` par ${libelleDeLaSource(modification.source)}`
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
  statutCartographie: statutCartographie({
    visiblePourCartographieNationale: estPublie(lieu.visibilite),
    structureCartographieNationaleId: lieu.identifiantCartographie,
    hasRecentModification: isAfter(
      lieu.derniereModification.date,
      subDays(maintenant, 1),
    ),
  }),
  mediateurs: mediateurs(lieu.mediateurs),
})
