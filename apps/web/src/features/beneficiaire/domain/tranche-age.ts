import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { AnneeNaissance } from './annee-naissance'

export const tranchesAge = [
  'SoixanteDixPlus',
  'SoixanteSoixanteNeuf',
  'QuaranteCinquanteNeuf',
  'VingtCinqTrenteNeuf',
  'DixHuitVingtQuatre',
  'DouzeDixHuit',
  'MoinsDeDouze',
  'NonCommunique',
] as const

/**
 * Une tranche absente vaut `NonCommunique` : l'absence est une valeur du
 * domaine, donc le constructeur est total (accepte aussi une valeur absente).
 */
export const TrancheAge = defineModel(
  z
    .enum(tranchesAge)
    .nullish()
    .transform((value) => value ?? 'NonCommunique'),
)

export type TrancheAge = Model.TypeOf<typeof TrancheAge>

export const trancheAgeLabels: Record<TrancheAge, string> = {
  SoixanteDixPlus: '70 ans et plus',
  SoixanteSoixanteNeuf: '60 - 69 ans',
  QuaranteCinquanteNeuf: '40 - 59 ans',
  VingtCinqTrenteNeuf: '25 - 39 ans',
  DixHuitVingtQuatre: '18 - 24 ans',
  DouzeDixHuit: '12 - 17 ans',
  MoinsDeDouze: 'Moins de 12 ans',
  NonCommunique: 'Non communiqué',
}

const tranchesAgeParSeuil = [
  { seuil: 12, tranche: 'MoinsDeDouze' },
  { seuil: 18, tranche: 'DouzeDixHuit' },
  { seuil: 25, tranche: 'DixHuitVingtQuatre' },
  { seuil: 40, tranche: 'VingtCinqTrenteNeuf' },
  { seuil: 60, tranche: 'QuaranteCinquanteNeuf' },
  { seuil: 70, tranche: 'SoixanteSoixanteNeuf' },
] as const

const toAge = (anneeNaissance: AnneeNaissance): number =>
  new Date().getFullYear() - anneeNaissance

export const trancheAgeFromAnneeNaissance = (
  anneeNaissance: AnneeNaissance,
): TrancheAge =>
  TrancheAge(
    tranchesAgeParSeuil.find(({ seuil }) => toAge(anneeNaissance) < seuil)
      ?.tranche ?? 'SoixanteDixPlus',
  )

/**
 * La tranche d'âge est dérivée de l'année de naissance (règle métier),
 * jamais saisie directement. Sans année de naissance : `NonCommunique`.
 */
export const trancheAgeForBeneficiaire = (
  anneeNaissance: AnneeNaissance | null,
): TrancheAge =>
  anneeNaissance
    ? trancheAgeFromAnneeNaissance(anneeNaissance)
    : TrancheAge('NonCommunique')

/**
 * Dérive la tranche d'âge d'une année « brute » (valeur de formulaire ou source
 * externe) : valide via `AnneeNaissance`, renvoie `null` si absente ou invalide.
 */
const trancheAgeFromAnneeNaissanceValue = (
  anneeNaissance?: string | number | null,
): TrancheAge | null => {
  const annee =
    typeof anneeNaissance === 'string'
      ? Number.parseInt(anneeNaissance, 10)
      : anneeNaissance
  const parsed = AnneeNaissance.schema.safeParse(annee)
  return parsed.success ? trancheAgeFromAnneeNaissance(parsed.data) : null
}

/**
 * Tranche effective pour l'affichage ou la saisie : dérivée de l'année si elle
 * est exploitable, sinon la valeur stockée, sinon `null`. Couvre les entrées
 * non validées (formulaire, synchro RDVSP) — corrige le « bug RDVSP » où une
 * tranche stockée nulle masquait une année renseignée.
 */
export const effectiveTrancheAge = (
  anneeNaissance?: string | number | null,
  trancheAge?: TrancheAge | null,
): TrancheAge | null =>
  trancheAgeFromAnneeNaissanceValue(anneeNaissance) ?? trancheAge ?? null
