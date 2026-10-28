import { pluriel } from '@app/web/libraries/pluriel'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import {
  dateAsDayInTimeZone,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { formatInTimeZone } from 'date-fns-tz'
import {
  type ActiviteDeCoordination,
  type DureeEnMinutes,
  partenairesDe,
  participantsDe,
} from '../../../domain'
import {
  autreOuPrecision,
  libelleCompletDuType,
  libelleCourtDuTypeDeStructure,
  libelleDeLEchelon,
  libelleDeLInitiative,
  libelleDuType,
  objetsDe,
  organisateursDe,
  thematiquesDe,
} from '../../../ui/libelles-de-coordination'
import type { ActivitesDeCoordinationListees } from '../domain'

export type Rubrique = {
  readonly titre: string
  readonly elements: readonly string[]
}

export type DetailDeCoordination = {
  readonly id: string
  readonly segmentDeType: string
  readonly titre: string
  readonly jour: string
  readonly duree: string | null
  readonly infos: readonly string[]
  readonly objets: readonly string[]
  readonly enregistreeLe: string
  readonly modifieeLe: string | null
  readonly rubriques: readonly Rubrique[]
  readonly notes: { readonly titre: string; readonly html: string } | null
}

export type CarteDeCoordination = {
  readonly id: string
  readonly type: ActiviteDeCoordination['_tag']
  readonly titre: string
  readonly infos: readonly string[]
  readonly objets: readonly string[]
  readonly enregistreeLe: string
  readonly detail: DetailDeCoordination
}

export type JourDeCoordinations = {
  readonly cle: string
  readonly jour: string
  readonly cartes: readonly CarteDeCoordination[]
}

export type ListeDesCoordinations = {
  readonly titre: string
  readonly jours: readonly JourDeCoordinations[]
  readonly pages: number
}

const jourIso = (date: Date): string => date.toISOString().slice(0, 10)

const titreDe = (activite: ActiviteDeCoordination): string =>
  activite._tag === 'Animation' || activite.nom === null
    ? libelleDuType(activite._tag)
    : `${libelleDuType(activite._tag)} · ${activite.nom}`

const compte = (nombre: number, singulier: string, plurielle: string) =>
  nombre === 0 ? [] : [`${nombre} ${pluriel(nombre, singulier, plurielle)}`]

const infosDe = (activite: ActiviteDeCoordination): readonly string[] => [
  ...compte(participantsDe(activite), 'participant', 'participants'),
  ...compte(partenairesDe(activite), 'partenaire', 'partenaires'),
]

export const dureeLisible = (duree: DureeEnMinutes): string => {
  const heures = Math.floor(duree / 60)
  const minutes = duree % 60
  if (heures === 0) return `${minutes}min`
  return minutes === 0 ? `${heures}h` : `${heures}h${minutes}`
}

const horodatage = (date: Date, timezone: string): string =>
  `${dateAsDayInTimeZone(date, timezone)} à ${dateAsTimeInTimeZone(date, timezone)}`

const rubrique = (titre: string, elements: readonly string[]): Rubrique[] =>
  elements.length === 0 ? [] : [{ titre, elements }]

const avecEffectif = (libelle: string, effectif: number | null): string[] =>
  effectif === null || effectif === 0 ? [] : [`${libelle} · ${effectif}`]

const rubriquesDe = (activite: ActiviteDeCoordination): readonly Rubrique[] => [
  ...(activite._tag === 'Animation'
    ? [
        ...rubrique('Participants à l’intervention', [
          ...avecEffectif(
            'Médiateur·ice·s numérique·s',
            activite.intervenants.mediateurs,
          ),
          ...avecEffectif('Structure·s', activite.intervenants.structures),
          ...avecEffectif(
            'Autres acteurs (Réseau d’inclusion numérique)',
            activite.intervenants.autresActeurs,
          ),
        ]),
        ...rubrique(
          'Qui est à l’initiative de cette intervention ?',
          activite.initiative === null
            ? []
            : [libelleDeLInitiative(activite.initiative)],
        ),
      ]
    : []),
  ...rubrique(
    'Thématiques d’animation',
    thematiquesDe(autreOuPrecision)(activite),
  ),
  ...rubrique('Organisé par', organisateursDe(autreOuPrecision)(activite)),
  ...(activite._tag === 'Animation' || activite.echelon === null
    ? []
    : rubrique('Échelon territorial de l’évènement', [
        libelleDeLEchelon(activite.echelon),
      ])),
  ...(activite._tag === 'Partenariat'
    ? rubrique(
        'Partenaires',
        activite.structuresPartenaires.map(({ nom, type }) => {
          const court = libelleCourtDuTypeDeStructure(type)
          return court === null ? nom : `${nom} · ${court}`
        }),
      )
    : []),
  ...rubrique(
    'Tags spécifiques',
    activite.tags.map(({ nom }) => nom),
  ),
]

const detailDe =
  (timezone: string) =>
  (activite: ActiviteDeCoordination): DetailDeCoordination => {
    const enregistreeLe = horodatage(activite.creation, timezone)
    const modifieeLe = horodatage(activite.modification, timezone)
    return {
      id: activite.id,
      segmentDeType: activite._tag.toLowerCase(),
      titre: titreDe(activite),
      jour: formatActiviteDayDate(jourIso(activite.date)),
      duree: activite.duree === null ? null : dureeLisible(activite.duree),
      infos: infosDe(activite),
      objets: objetsDe(autreOuPrecision)(activite),
      enregistreeLe,
      modifieeLe: modifieeLe === enregistreeLe ? null : modifieeLe,
      rubriques: rubriquesDe(activite),
      notes:
        activite.notes === null
          ? null
          : {
              titre: `Notes sur ${libelleCompletDuType(activite._tag)}`,
              html: activite.notes,
            },
    }
  }

const carteDe =
  (timezone: string) =>
  (activite: ActiviteDeCoordination): CarteDeCoordination => ({
    id: activite.id,
    type: activite._tag,
    titre: titreDe(activite),
    infos: infosDe(activite),
    objets: objetsDe(autreOuPrecision)(activite),
    enregistreeLe: formatInTimeZone(
      activite.creation,
      timezone,
      "dd.MM.yyyy 'à' HH:mm",
    ),
    detail: detailDe(timezone)(activite),
  })

const parJour = (
  activites: readonly ActiviteDeCoordination[],
): readonly (readonly ActiviteDeCoordination[])[] =>
  activites.reduce<readonly (readonly ActiviteDeCoordination[])[]>(
    (jours, activite) => {
      const dernier = jours.at(-1)
      return dernier !== undefined &&
        jourIso(dernier[0].date) === jourIso(activite.date)
        ? [...jours.slice(0, -1), [...dernier, activite]]
        : [...jours, [activite]]
    },
    [],
  )

const titreDeLaListe = (total: number, filtre: boolean): string =>
  filtre
    ? `${total} ${pluriel(total, 'activité correspond', 'activités correspondent')} à votre recherche`
    : `${total} ${pluriel(total, 'activité enregistrée', 'activités enregistrées')}`

export const listeDesCoordinations = ({
  listees: { activites, total, pages },
  filtre,
  timezone,
}: {
  listees: ActivitesDeCoordinationListees
  filtre: boolean
  timezone: string
}): ListeDesCoordinations => ({
  titre: titreDeLaListe(total, filtre),
  jours: parJour(activites).map((activitesDuJour) => {
    const cle = jourIso(activitesDuJour[0].date)
    return {
      cle,
      jour: formatActiviteDayDate(cle),
      cartes: activitesDuJour.map(carteDe(timezone)),
    }
  }),
  pages,
})
