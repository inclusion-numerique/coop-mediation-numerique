import { htmlToText } from '@app/web/utils/htmlToText'
import { booleanToYesNoLabel } from '@app/web/utils/yesNoBooleanOptions'
import { isEqual } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import type { Equipement, Orientation } from '../../../domain'
import { autonomieStars, autonomieValues } from '../../../ui/libelles/autonomie'
import { materielLabels } from '../../../ui/libelles/materiel'
import {
  niveauAtelierStars,
  niveauAtelierValues,
} from '../../../ui/libelles/niveau-atelier'
import {
  genreLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '../../../ui/libelles/profil'
import { structuresRedirectionLabels } from '../../../ui/libelles/structures-redirection'
import { thematiqueLabels } from '../../../ui/libelles/thematique'
import { typeActiviteLabels } from '../../../ui/libelles/type-activite'
import { typeLieuLabels } from '../../../ui/libelles/type-lieu'
import { valeurDe } from '../../../ui/libelles/valeur-de'
import type {
  AccompagnementExporte,
  ActiviteExportee,
  ColonnesDeLExport,
  Identite,
} from '../domain'

export type Cellule = string | number | boolean | Date

const SAUT_DE_LIGNE = '\n'

const si = <T>(condition: boolean, valeurs: readonly T[]): readonly T[] =>
  condition ? valeurs : []

export const entetesDuClasseur = ({
  personnel,
  source,
}: ColonnesDeLExport): readonly string[] => [
  'Date',
  'Enregistré le',
  'Dernière modification le',
  ...si(!personnel, [
    'Prénom du médiateur',
    'Nom du médiateur',
    'Rôle',
    'ID - Conum',
  ]),
  'Type',
  'Participants',
  ...si(personnel, ['Bénéficiaire']),
  'Canaux d’accompagnement',
  'Nom du lieu',
  'Adresse',
  'Commune',
  'Code postal',
  'Code Insee',
  'Durée (min)',
  'Nom de l’atelier',
  'Matériel numérique utilisé',
  'Thématique(s) d’accompagnement',
  'Tags',
  'Nom de la démarche administrative',
  'Niveau d’autonomie (ou de l’atelier)',
  'Bénéficiaire réorienté',
  'Structure de redirection',
  'Commune du bénéficiaire',
  'Code postal du bénéficiaire',
  'Code Insee du bénéficiaire',
  'Genre du bénéficiaire',
  'Tranche d’âge du bénéficiaire',
  'Statut du bénéficiaire',
  'Premier accompagnement',
  ...si(personnel, ['Notes supplémentaires']),
  ...si(source, ['Source de la donnée']),
  'ID CRA',
]

const horodatage =
  (fuseau: string) =>
  (instant: Date): string =>
    formatInTimeZone(instant, fuseau, "dd/MM/yyyy 'à' HH:mm", { locale: fr })

const jourDe = (date: string): Date => new Date(`${date}T00:00:00.000Z`)

export const nomAffiche = ({ prenom, nom }: Identite): string =>
  [prenom, nom].filter((partie) => partie !== null).join(' ') ||
  'Bénéficiaire anonyme'

const equipementAffiche = (equipement: Equipement): string => {
  if (equipement._tag === 'AucunMateriel') return materielLabels.Aucun
  if (equipement._tag === 'NonRenseigne') return ''
  return equipement.materiels
    .map((materiel) => valeurDe(materielLabels)(materiel))
    .join(SAUT_DE_LIGNE)
}

const niveauAffiche = (activite: ActiviteExportee): string => {
  if (activite._tag === 'Individuel')
    return activite.autonomie === null
      ? ''
      : `${valeurDe(autonomieStars)(activite.autonomie)}/${autonomieValues.length}`
  return activite.niveau === null
    ? ''
    : `${valeurDe(niveauAtelierStars)(activite.niveau)}/${niveauAtelierValues.length}`
}

const orientationDe = (activite: ActiviteExportee): Orientation =>
  activite._tag === 'Individuel'
    ? activite.orientation
    : { _tag: 'NonRenseignee' }

const reorienteAffiche = (orientation: Orientation): string =>
  orientation._tag === 'NonRenseignee'
    ? ''
    : booleanToYesNoLabel(orientation._tag === 'Oriente')

const redirectionAffichee = (orientation: Orientation): string =>
  orientation._tag === 'Oriente' && orientation.vers !== null
    ? valeurDe(structuresRedirectionLabels)(orientation.vers)
    : ''

const SOURCE_AFFICHEE = {
  ImportV1: 'Espace coop (V1)',
  Coop: 'La Coop de la médiation numérique (V2)',
} as const

const ligneDe =
  (activite: ActiviteExportee, colonnes: ColonnesDeLExport, fuseau: string) =>
  (accompagnement: AccompagnementExporte, rang: number): readonly Cellule[] => {
    const { mediateur, lieu, accompagnements } = activite
    const { residence } = accompagnement
    const orientation = orientationDe(activite)
    return [
      jourDe(activite.date),
      horodatage(fuseau)(activite.creation),
      isEqual(activite.creation, activite.modification)
        ? ''
        : horodatage(fuseau)(activite.modification),
      ...si<Cellule>(!colonnes.personnel, [
        mediateur.prenom ?? '',
        mediateur.nom ?? '',
        mediateur.conseillerNumerique ? 'Conseiller Numérique' : 'Médiateur',
        mediateur.conseillerNumerique,
      ]),
      typeActiviteLabels[activite._tag],
      accompagnements.length === 1
        ? 1
        : `${rang + 1}/${accompagnements.length}`,
      ...si(colonnes.personnel, [nomAffiche(accompagnement.beneficiaire)]),
      valeurDe(typeLieuLabels)(activite.typeDeLieu),
      lieu.nom ?? '',
      lieu.adresse ?? '',
      lieu.commune ?? '',
      lieu.codesPostaux ?? '',
      lieu.codeInsee ?? '',
      activite.duree,
      activite._tag === 'Collectif' ? (activite.titre ?? '') : '',
      equipementAffiche(activite.equipement),
      activite.thematiques
        .map((thematique) => valeurDe(thematiqueLabels)(thematique))
        .join(SAUT_DE_LIGNE),
      activite.tags.join(SAUT_DE_LIGNE),
      activite.precisionDeDemarche ?? '',
      niveauAffiche(activite),
      reorienteAffiche(orientation),
      redirectionAffichee(orientation),
      residence.commune ?? '',
      residence.codesPostaux ?? '',
      residence.codeInsee ?? '',
      valeurDe(genreLabels)(accompagnement.genre),
      valeurDe(trancheAgeLabels)(accompagnement.trancheDAge),
      valeurDe(statutSocialLabels)(accompagnement.statutSocial),
      booleanToYesNoLabel(accompagnement.premierAccompagnement),
      ...si(colonnes.personnel, [
        activite.notes !== null && rang === 0 ? htmlToText(activite.notes) : '',
      ]),
      ...si(colonnes.source, [valeurDe(SOURCE_AFFICHEE)(activite.source)]),
      activite.id,
    ]
  }

export const lignesDuClasseur = (
  activites: readonly ActiviteExportee[],
  colonnes: ColonnesDeLExport,
  fuseau: string,
): readonly (readonly Cellule[])[] =>
  activites.flatMap((activite) =>
    activite.accompagnements.map(ligneDe(activite, colonnes, fuseau)),
  )

export const nombreDAccompagnementsExportes = (
  activites: readonly ActiviteExportee[],
): number =>
  activites.reduce(
    (total, { accompagnements }) => total + accompagnements.length,
    0,
  )
