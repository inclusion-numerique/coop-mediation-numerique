import { dateAsIsoDay, formatInTimeZone, fr, isEqual } from '@/libraries/date'
import { htmlToText } from '@/libraries/texte'
import type {
  ActiviteDeCoordination,
  CriteresDesCoordinations,
  TagDeLActivite,
} from '../../../../domain'
import {
  autreAvecPrecision,
  libelleDeLEchelon,
  libelleDeLInitiative,
  libelleDuType,
  libelleDuTypeDeStructure,
  objetsDe,
  organisateursDe,
  thematiquesDe,
} from '../../../../ui/labels/libelles/coordination.labels'

type Type = ActiviteDeCoordination['_tag']

const SAUT_DE_LIGNE = '\n'
const SANS_OBJET = '/'

const ENTETES = [
  'Date de l’activité',
  'Type',
  'Durée (min.)',
  'Participants',
  'Médiateur·ice·s numérique·s',
  'Structure·s',
  'Autres acteur.trice.s',
  'Nom de l’évènement',
  'Type d’animation, type d’évènement, nature du partenariat',
  'Organisé par',
  'Structure·s partenaire·s (Nom)',
  'Structure·s partenaire·s (type)',
  'Échelon territorial de l’évènement ou du partenariat',
  'Qui est à l’initiative de cette intervention ?',
  'Thématique(s) d’animation',
  'Tags',
  'Notes',
  'Enregistrée le',
  'Dernière modification le',
  'ID CRA',
]

const pour =
  (activite: ActiviteDeCoordination) =>
  (types: readonly Type[], valeur: () => string | number | null) =>
    types.includes(activite._tag) ? (valeur() ?? '') : SANS_OBJET

const lignes = (valeurs: readonly (string | null)[]): string =>
  valeurs.filter((valeur) => valeur !== null).join(SAUT_DE_LIGNE)

const horodatage =
  (fuseau: string) =>
  (date: Date): string =>
    formatInTimeZone(date, fuseau, "dd/MM/yyyy 'à' HH:mm", { locale: fr })

const ligneDe = (fuseau: string) => (activite: ActiviteDeCoordination) => {
  const seulementPour = pour(activite)
  const animation = activite._tag === 'Animation' ? activite : null
  const evenement = activite._tag === 'Evenement' ? activite : null
  const partenariat = activite._tag === 'Partenariat' ? activite : null
  const echelon = activite._tag === 'Animation' ? null : activite.echelon
  const nom = activite._tag === 'Animation' ? null : activite.nom

  return [
    new Date(`${activite.date}T00:00:00.000Z`),
    libelleDuType(activite._tag),
    seulementPour(['Animation'], () => animation?.duree ?? null),
    seulementPour(['Evenement'], () => evenement?.participants ?? null),
    seulementPour(
      ['Animation'],
      () => animation?.intervenants.mediateurs ?? null,
    ),
    seulementPour(
      ['Animation'],
      () => animation?.intervenants.structures ?? null,
    ),
    seulementPour(
      ['Animation'],
      () => animation?.intervenants.autresActeurs ?? null,
    ),
    seulementPour(['Evenement', 'Partenariat'], () => nom),
    lignes(objetsDe(autreAvecPrecision)(activite)),
    seulementPour(['Evenement'], () =>
      lignes(organisateursDe(autreAvecPrecision)(activite)),
    ),
    seulementPour(['Partenariat'], () =>
      lignes(partenariat?.structuresPartenaires.map(({ nom }) => nom) ?? []),
    ),
    seulementPour(['Partenariat'], () =>
      lignes(
        partenariat?.structuresPartenaires.map(({ type }) =>
          libelleDuTypeDeStructure(type),
        ) ?? [],
      ),
    ),
    seulementPour(['Evenement', 'Partenariat'], () =>
      echelon === null ? null : libelleDeLEchelon(echelon),
    ),
    seulementPour(['Animation'], () =>
      animation?.initiative == null
        ? null
        : libelleDeLInitiative(animation.initiative),
    ),
    seulementPour(['Animation'], () =>
      lignes(thematiquesDe(autreAvecPrecision)(activite)),
    ),
    lignes(activite.tags.map(({ nom }) => nom)),
    activite.notes === null ? '' : htmlToText(activite.notes),
    horodatage(fuseau)(activite.creation),
    isEqual(activite.creation, activite.modification)
      ? ''
      : horodatage(fuseau)(activite.modification),
    activite.id,
  ]
}

const filtresDe = (
  { periode, types }: CriteresDesCoordinations,
  tags: readonly TagDeLActivite[],
): readonly (readonly string[])[] => [
  [
    'Période',
    periode === null
      ? '-'
      : `${dateAsIsoDay(periode.du)} - ${dateAsIsoDay(periode.au)}`,
  ],
  ['Type d’activité', types.map(libelleDuType).join(', ') || '-'],
  ['Tags', tags.map(({ nom }) => nom).join(', ') || '-'],
]

export const lignesDesCoordinations = ({
  activites,
  criteres,
  tags,
  fuseau,
}: {
  activites: readonly ActiviteDeCoordination[]
  criteres: CriteresDesCoordinations
  tags: readonly TagDeLActivite[]
  fuseau: string
}) => ({
  entetes: ENTETES,
  lignes: activites.map(ligneDe(fuseau)),
  filtres: filtresDe(criteres, tags),
})
