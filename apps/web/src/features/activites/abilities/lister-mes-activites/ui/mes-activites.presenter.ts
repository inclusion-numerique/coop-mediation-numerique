import { pluriel } from '@app/web/libraries/pluriel'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import {
  dateAsDay,
  dateAsDayWithHourInTimezone,
} from '@app/web/utils/dateAsDay'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import { formatInTimeZone } from 'date-fns-tz'
import type {
  ActiviteConsultee,
  ChronologieDesActivites,
  ElementDeChronologie,
} from '../../../domain'
import {
  type CarteDActivite,
  carteDActivite,
  nombreDeParticipants,
  nomDuBeneficiaire,
} from '../../../ui/carte/carte-d-activite.presenter'
import {
  type CarteDeRendezVous,
  carteDeRendezVous,
} from '../../../ui/carte/carte-de-rendez-vous.presenter'
import {
  type DetailDActivite,
  detailDeLActivite,
} from '../../../ui/detail/detail-de-l-activite.presenter'
import { typeActiviteLabels } from '../../../ui/libelles/type-activite'
import { valeurDe } from '../../../ui/libelles/valeur-de'

export type CarteDuJour =
  | { readonly _tag: 'Activite'; readonly carte: CarteDActivite }
  | { readonly _tag: 'RendezVous'; readonly carte: CarteDeRendezVous }

export type JourDeLaListe = {
  readonly cle: string
  readonly jour: string
  readonly cartes: readonly CarteDuJour[]
}

const jourDe = (element: ElementDeChronologie, fuseau: string): string =>
  element._tag === 'Activite'
    ? element.activite.activite.date
    : formatInTimeZone(element.rendezVous.debut, fuseau, 'yyyy-MM-dd')

const carteDe = (element: ElementDeChronologie, fuseau: string): CarteDuJour =>
  element._tag === 'Activite'
    ? { _tag: 'Activite', carte: carteDActivite(element.activite, fuseau) }
    : {
        _tag: 'RendezVous',
        carte: carteDeRendezVous(element.rendezVous, fuseau),
      }

export const cartesDeLaChronologie = (
  elements: readonly ElementDeChronologie[],
  fuseau: string,
): readonly CarteDuJour[] => elements.map((element) => carteDe(element, fuseau))

export const joursDeLaListe = (
  elements: readonly ElementDeChronologie[],
  fuseau: string,
): readonly JourDeLaListe[] =>
  elements.reduce<readonly JourDeLaListe[]>((jours, element) => {
    const cle = jourDe(element, fuseau)
    const carte = carteDe(element, fuseau)
    const dernier = jours.at(-1)
    return dernier?.cle === cle
      ? [
          ...jours.slice(0, -1),
          { ...dernier, cartes: [...dernier.cartes, carte] },
        ]
      : [...jours, { cle, jour: formatActiviteDayDate(cle), cartes: [carte] }]
  }, [])

export const titreDuDecompte = (nombre: number, filtree: boolean): string => {
  if (nombre === 0)
    return filtree
      ? 'Aucune activité ne correspond à votre recherche'
      : 'Aucune activité enregistrée'
  const activites = pluriel(nombre, 'activité', 'activités')
  return filtree
    ? `${nombre} ${activites} ${pluriel(nombre, 'correspond', 'correspondent')} à votre recherche`
    : `${nombre} ${activites} ${pluriel(nombre, 'enregistrée', 'enregistrées')}`
}

export const decompteDeLaListe = (
  { total }: ChronologieDesActivites,
  filtree: boolean,
): string => titreDuDecompte(total.activites + total.rendezVous, filtree)

export type LigneDuTableau = {
  readonly id: string
  readonly type: string
  readonly personnes: string
  readonly jour: string
  readonly duree: string
  readonly lieu: string
  readonly enregistreeLe: string
  readonly detail: DetailDActivite
}

export const ligneDuTableau = (
  consultee: ActiviteConsultee,
  fuseau: string,
): LigneDuTableau => {
  const { activite, affichage } = consultee
  return {
    id: activite.id,
    type: valeurDe(typeActiviteLabels)(activite._tag),
    personnes:
      activite._tag === 'Collectif'
        ? `${nombreDeParticipants(consultee)} participants`
        : nomDuBeneficiaire(consultee),
    jour: dateAsDay(new Date(activite.date)),
    duree: dureeAsString(activite.duree),
    lieu:
      activite.lieu._tag === 'LieuActivite' && affichage.lieu !== null
        ? affichage.lieu.nom
        : '-',
    enregistreeLe: dateAsDayWithHourInTimezone(activite.creation, fuseau),
    detail: detailDeLActivite(consultee, fuseau),
  }
}

export const lignesDuTableau = (
  { elements }: ChronologieDesActivites,
  fuseau: string,
): readonly LigneDuTableau[] =>
  elements.flatMap((element) =>
    element._tag === 'Activite'
      ? [ligneDuTableau(element.activite, fuseau)]
      : [],
  )
