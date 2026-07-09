import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'

/**
 * Re-canonicalise les données des bénéficiaires existants en les faisant passer
 * par le transfer layer (toDomain → fromDomain), donc par les value objects :
 * téléphone en international, email en minuscules, codes sans espaces, champs
 * trimés. Opération de maintenance idempotente : ne met à jour que les fiches
 * qui changent, préserve `modification`, et saute (en les remontant) les fiches
 * dont une donnée est invalide.
 *
 * En `dryRun` (défaut), aucune écriture : l'opération calcule et rapporte les
 * changements qu'elle appliquerait, pour inspection avant exécution réelle.
 */
// Fiche sautée car une donnée reste invalide. `champ` + `valeur` disent quoi
// trier à la main : le téléphone rejeté par libphonenumber (`custom`) ou
// l'email syntaxiquement invalide.
export type NormaliserBeneficiaireError = {
  readonly id: BeneficiaireId
  readonly champ: 'telephone' | 'email' | 'autre'
  readonly valeur: string | null
  readonly reason: string
}

// Diff téléphone/email d'une fiche qui serait (ou a été) mise à jour, pour
// inspection — notamment l'impact de l'élargissement de la validation
// téléphone aux numéros internationaux.
export type NormaliserBeneficiaireChange = {
  readonly id: BeneficiaireId
  readonly telephoneAvant: string | null
  readonly telephoneApres: string | null
  readonly emailAvant: string | null
  readonly emailApres: string | null
}

export type NormaliserBeneficiairesResult = {
  readonly dryRun: boolean
  readonly updated: number
  readonly skipped: number
  readonly errors: ReadonlyArray<NormaliserBeneficiaireError>
  readonly changes: ReadonlyArray<NormaliserBeneficiaireChange>
}

export type NormaliserBeneficiairesOptions = {
  readonly dryRun?: boolean
}

export type NormaliserBeneficiaires = (
  options?: NormaliserBeneficiairesOptions,
) => Promise<NormaliserBeneficiairesResult>
