import { pluriel } from '@app/web/libraries/pluriel'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import {
  dateAsDayInTimeZone,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import type {
  AccompagnementIndividuel,
  ActiviteConsultee,
  ActiviteDeMediation,
  AffichageDeLActivite,
  AtelierCollectif,
  Commune,
  ParticipantsAnonymes,
} from '../../domain'
import { autonomieStars } from '../libelles/autonomie'
import { materielLabels } from '../libelles/materiel'
import { niveauAtelierStars } from '../libelles/niveau-atelier'
import {
  sexeLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '../libelles/profil'
import {
  apparenceDuStatut,
  type SeveriteDeBadge,
} from '../libelles/statut-de-rendez-vous'
import { structuresRedirectionLabels } from '../libelles/structures-redirection'
import { thematiqueLabels } from '../libelles/thematique'
import { typeActiviteLabels } from '../libelles/type-activite'
import { valeurDe } from '../libelles/valeur-de'

export type Rubrique =
  | {
      readonly _tag: 'Liste'
      readonly titre: string
      readonly elements: readonly string[]
    }
  | {
      readonly _tag: 'Etoiles'
      readonly titre: string
      readonly etoiles: number
    }
  | { readonly _tag: 'Texte'; readonly titre: string; readonly texte: string }

export type BeneficiaireDuDetail =
  | {
      readonly _tag: 'Suivi'
      readonly id: string
      readonly nom: string
      readonly activites: string
    }
  | { readonly _tag: 'Anonyme'; readonly infos: readonly string[] }

export type ParticipantsDuDetail = {
  readonly titre: string
  readonly titreDesSuivis: string | null
  readonly suivis: readonly { readonly id: string; readonly nom: string }[]
  readonly titreDesAnonymes: string | null
  readonly anonymes: readonly string[]
}

export type DetailDActivite = {
  readonly id: string
  readonly segmentDeType: 'individuel' | 'collectif'
  readonly titre: string
  readonly jour: string
  readonly duree: string
  readonly lieu: string
  readonly enregistreeLe: string
  readonly modifieeLe: string | null
  readonly beneficiaire: BeneficiaireDuDetail | null
  readonly participants: ParticipantsDuDetail | null
  readonly rendezVous: {
    readonly libelle: string
    readonly severite: SeveriteDeBadge
    readonly lien: string
  } | null
  readonly rubriques: readonly Rubrique[]
  readonly demarche: readonly Rubrique[] | null
  readonly notes: { readonly titre: string; readonly html: string } | null
}

const thematique = valeurDe(thematiqueLabels)

const ville = (commune: Commune): string =>
  `${commune.codePostal} ${commune.nom}`

const lieuDe = (
  activite: ActiviteDeMediation,
  affichage: AffichageDeLActivite,
): string => {
  const { lieu } = activite
  if (lieu._tag === 'ADistance') return 'À distance'
  if (lieu._tag !== 'LieuActivite') return ville(lieu.commune)
  if (affichage.lieu === null) return 'Non renseigné'
  return affichage.lieu.localite === null
    ? affichage.lieu.nom
    : `${affichage.lieu.nom} · ${affichage.lieu.localite}`
}

const nonVide = (rubrique: Rubrique): boolean =>
  rubrique._tag !== 'Liste' || rubrique.elements.length > 0

const thematiquesDAccompagnement = (activite: ActiviteDeMediation) => [
  ...activite.thematiques.mediation.map(thematique),
  ...(activite.thematiques.demarche === null
    ? []
    : [thematique('AideAuxDemarchesAdministratives')]),
]

const rubriquesDe = (
  activite: ActiviteDeMediation,
  affichage: AffichageDeLActivite,
): readonly Rubrique[] => {
  const thematiques = thematiquesDAccompagnement(activite)
  const { equipement } = activite
  return [
    {
      _tag: 'Liste' as const,
      titre: 'Matériel utilisé',
      elements:
        equipement._tag === 'Materiels'
          ? equipement.materiels.map(valeurDe(materielLabels))
          : equipement._tag === 'AucunMateriel'
            ? [materielLabels.Aucun]
            : [],
    },
    {
      _tag: 'Liste' as const,
      titre: pluriel(
        thematiques.length,
        'Thématique d’accompagnement',
        'Thématiques d’accompagnement',
      ),
      elements: thematiques,
    },
    {
      _tag: 'Liste' as const,
      titre: pluriel(
        affichage.tags.length,
        'Tag spécifique',
        'Tags spécifiques',
      ),
      elements: affichage.tags.map(({ nom }) => nom),
    },
    ...(activite._tag === 'Individuel' ? rubriquesIndividuelles(activite) : []),
    ...(activite._tag === 'Collectif' && activite.niveau !== null
      ? [
          {
            _tag: 'Etoiles' as const,
            titre: 'Niveau de l’atelier',
            etoiles: valeurDe(niveauAtelierStars)(activite.niveau),
          },
        ]
      : []),
  ].filter(nonVide)
}

const rubriquesIndividuelles = (
  activite: AccompagnementIndividuel,
): readonly Rubrique[] => [
  ...(activite.autonomie === null
    ? []
    : [
        {
          _tag: 'Etoiles' as const,
          titre: 'Niveau d’autonomie du bénéficiaire',
          etoiles: valeurDe(autonomieStars)(activite.autonomie),
        },
      ]),
  ...(activite.orientation._tag === 'Oriente' &&
  activite.orientation.vers !== null
    ? [
        {
          _tag: 'Texte' as const,
          titre: 'Orientation du bénéficiaire',
          texte: valeurDe(structuresRedirectionLabels)(
            activite.orientation.vers,
          ),
        },
      ]
    : []),
]

const demarcheDe = (
  activite: ActiviteDeMediation,
): readonly Rubrique[] | null => {
  const { demarche } = activite.thematiques
  if (demarche === null) return null
  const administratives = demarche.thematiques.map(thematique)
  return [
    {
      _tag: 'Liste' as const,
      titre: pluriel(
        administratives.length,
        'Thématique d’accompagnement',
        'Thématiques d’accompagnement',
      ),
      elements: administratives,
    },
    ...(demarche.precision === null
      ? []
      : [
          {
            _tag: 'Texte' as const,
            titre: 'Nom de la démarche',
            texte: demarche.precision,
          },
        ]),
  ].filter(nonVide)
}

const nomDe = ({ prenom, nom }: { prenom: string; nom: string }) =>
  [prenom, nom].filter(Boolean).join(' ')

const beneficiaireDe = (
  activite: AccompagnementIndividuel,
  affichage: AffichageDeLActivite,
): BeneficiaireDuDetail => {
  const { beneficiaire } = activite
  if (beneficiaire._tag === 'Suivi') {
    const suivi = affichage.suivis.find(({ id }) => id === beneficiaire.id)
    const activites = suivi?.nombreDActivites ?? 0
    return {
      _tag: 'Suivi',
      id: beneficiaire.id,
      nom: suivi === undefined ? 'Bénéficiaire anonyme' : nomDe(suivi),
      activites: `${activites} ${pluriel(activites, 'activité', 'activités')}`,
    }
  }
  const { profil } = beneficiaire
  return {
    _tag: 'Anonyme',
    infos: [
      beneficiaire.dejaAccompagne
        ? 'Bénéficiaire déjà accompagné'
        : 'Nouveau bénéficiaire',
      [
        profil.genre === 'NonCommunique'
          ? ''
          : valeurDe(sexeLabels)(profil.genre),
        profil.trancheDAge === 'NonCommunique'
          ? ''
          : valeurDe(trancheAgeLabels)(profil.trancheDAge),
        profil.statutSocial === 'NonCommunique'
          ? ''
          : valeurDe(statutSocialLabels)(profil.statutSocial),
      ]
        .filter(Boolean)
        .join(', '),
      profil.residence === null ? '' : ville(profil.residence),
    ].filter(Boolean),
  }
}

const nombre = (effectif: number, singulier: string, plurielle: string) =>
  `${effectif} ${pluriel(effectif, singulier, plurielle)}`

const GENRES = [
  ['masculin', 'Masculin'],
  ['feminin', 'Feminin'],
  ['nonCommunique', 'NonCommunique'],
] as const

const TRANCHES = [
  ['soixanteDixPlus', 'SoixanteDixPlus'],
  ['soixanteSoixanteNeuf', 'SoixanteSoixanteNeuf'],
  ['quaranteCinquanteNeuf', 'QuaranteCinquanteNeuf'],
  ['vingtCinqTrenteNeuf', 'VingtCinqTrenteNeuf'],
  ['dixHuitVingtQuatre', 'DixHuitVingtQuatre'],
  ['douzeDixHuit', 'DouzeDixHuit'],
  ['moinsDeDouze', 'MoinsDeDouze'],
  ['nonCommunique', 'NonCommunique'],
] as const

const STATUTS = [
  ['retraite', 'Retraite'],
  ['sansEmploi', 'SansEmploi'],
  ['enEmploi', 'EnEmploi'],
  ['scolarise', 'Scolarise'],
  ['nonCommunique', 'NonCommunique'],
] as const

const repartition = (
  lignes: readonly {
    readonly effectif: number
    readonly libelle: string
    readonly nonCommunique: boolean
  }[],
  prefixeNonCommunique: string,
  format: (
    effectif: number,
    prefixe: string,
    libelle: string,
    accord: boolean,
  ) => string,
): string =>
  lignes
    .filter(({ effectif }) => effectif > 0)
    .map(({ effectif, libelle, nonCommunique }) =>
      format(
        effectif,
        nonCommunique ? prefixeNonCommunique : '',
        libelle.toLocaleLowerCase(),
        !nonCommunique,
      ),
    )
    .join(', ')

const accorde = (
  effectif: number,
  prefixe: string,
  libelle: string,
  accord: boolean,
) => `${effectif}${prefixe} ${libelle}${accord && effectif > 1 ? 's' : ''}`

const anonymesDe = (anonymes: ParticipantsAnonymes): readonly string[] => {
  const nouveaux = anonymes.total - anonymes.dejaAccompagnes
  return [
    [
      nombre(nouveaux, 'nouveau bénéficiaire', 'nouveaux bénéficiaires'),
      nombre(
        anonymes.dejaAccompagnes,
        'bénéficiaire déjà accompagné',
        'bénéficiaires déjà accompagnés',
      ),
    ].join(', '),
    repartition(
      GENRES.map(([cle, genre]) => ({
        effectif: anonymes.genres[cle],
        libelle: valeurDe(sexeLabels)(genre),
        nonCommunique: genre === 'NonCommunique',
      })),
      ' de genre',
      accorde,
    ),
    repartition(
      TRANCHES.map(([cle, tranche]) => ({
        effectif: anonymes.tranchesDAge[cle],
        libelle: valeurDe(trancheAgeLabels)(tranche),
        nonCommunique: tranche === 'NonCommunique',
      })),
      ' de tranche d’âge',
      (effectif, prefixe, libelle) => `${effectif} ×${prefixe} ${libelle}`,
    ),
    repartition(
      STATUTS.map(([cle, statut]) => ({
        effectif: anonymes.statutsSociaux[cle],
        libelle: valeurDe(statutSocialLabels)(statut),
        nonCommunique: statut === 'NonCommunique',
      })),
      ' de statut social',
      accorde,
    ),
  ]
}

const participantsDe = (
  atelier: AtelierCollectif,
  affichage: AffichageDeLActivite,
): ParticipantsDuDetail => {
  const suivis = affichage.suivis.map((suivi) => ({
    id: suivi.id,
    nom: nomDe(suivi),
  }))
  const anonymes = atelier.participants.anonymes.total
  const tous = suivis.length + anonymes
  const lesDeux = suivis.length > 0 && anonymes > 0
  const titre = lesDeux
    ? `${nombre(tous, 'participant', 'participants')} dont ${nombre(
        suivis.length,
        'bénéficiaire suivi',
        'bénéficiaires suivis',
      )} et ${nombre(anonymes, 'anonyme', 'anonymes')}`
    : suivis.length > 0
      ? nombre(suivis.length, 'bénéficiaire suivi', 'bénéficiaires suivis')
      : nombre(anonymes, 'participant anonyme', 'participants anonymes')
  return {
    titre,
    titreDesSuivis: lesDeux
      ? `${nombre(suivis.length, 'Participant suivi', 'Participants suivis')} :`
      : null,
    suivis,
    titreDesAnonymes: lesDeux
      ? `${nombre(anonymes, 'Participant anonyme', 'Participants anonymes')} :`
      : null,
    anonymes: anonymes > 0 ? anonymesDe(atelier.participants.anonymes) : [],
  }
}

const horodatage = (date: Date, fuseau: string): string =>
  `${dateAsDayInTimeZone(date, fuseau)} à ${dateAsTimeInTimeZone(date, fuseau)}`

export const detailDeLActivite = (
  { activite, affichage }: ActiviteConsultee,
  fuseau: string,
): DetailDActivite => {
  const enregistreeLe = horodatage(activite.creation, fuseau)
  const modifieeLe = horodatage(activite.modification, fuseau)
  const rendezVous = affichage.rendezVous
  return {
    id: activite.id,
    segmentDeType: activite._tag === 'Individuel' ? 'individuel' : 'collectif',
    titre:
      activite._tag === 'Collectif' && activite.titre !== null
        ? `${typeActiviteLabels.Collectif} · ${activite.titre}`
        : valeurDe(typeActiviteLabels)(activite._tag),
    jour: formatActiviteDayDate(activite.date),
    duree: dureeAsString(activite.duree),
    lieu: lieuDe(activite, affichage),
    enregistreeLe,
    modifieeLe: modifieeLe === enregistreeLe ? null : modifieeLe,
    beneficiaire:
      activite._tag === 'Individuel'
        ? beneficiaireDe(activite, affichage)
        : null,
    participants:
      activite._tag === 'Collectif'
        ? participantsDe(activite, affichage)
        : null,
    rendezVous:
      rendezVous === null
        ? null
        : {
            ...apparenceDuStatut(rendezVous.statut),
            lien: rendezVous.lienAgent,
          },
    rubriques: rubriquesDe(activite, affichage),
    demarche: demarcheDe(activite),
    notes:
      activite.notes === null
        ? null
        : {
            titre: `Notes sur l’${activite._tag === 'Collectif' ? 'atelier' : 'accompagnement'}`,
            html: activite.notes,
          },
  }
}
