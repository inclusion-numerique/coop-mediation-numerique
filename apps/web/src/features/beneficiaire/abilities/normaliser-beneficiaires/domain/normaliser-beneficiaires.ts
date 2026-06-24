import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'

/**
 * Re-canonicalise les données des bénéficiaires existants en les faisant passer
 * par le transfer layer (toDomain → fromDomain), donc par les value objects :
 * téléphone en international, email en minuscules, codes sans espaces, champs
 * trimés. Opération de maintenance idempotente : ne met à jour que les fiches
 * qui changent, préserve `modification`, et saute (en les remontant) les fiches
 * dont une donnée est invalide.
 */
export type NormaliserBeneficiaireError = {
  readonly id: BeneficiaireId
  readonly reason: string
}

export type NormaliserBeneficiairesResult = {
  readonly updated: number
  readonly skipped: number
  readonly errors: ReadonlyArray<NormaliserBeneficiaireError>
}

export type NormaliserBeneficiaires =
  () => Promise<NormaliserBeneficiairesResult>
