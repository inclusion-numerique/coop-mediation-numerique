import type { ProfilInscriptionValue } from '@/features/inscription/domain/profil-inscription'

export type ListerLesLieux<Lieu> = (input: {
  readonly mediateurId: string
}) => Promise<readonly Lieu[]>

export type InscritDuRecapitulatif = {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly profilInscription: ProfilInscriptionValue | null
  readonly acceptationCgu: Date | null
  readonly isConseillerNumerique: boolean
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}

export type RecapitulatifLu<Lieu> = {
  readonly lieuxActivite: readonly Lieu[]
  readonly mediateursCoordonnesCount: number | undefined
  readonly importedLieuxFromDataspace: Date | null
}
