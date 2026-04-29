import type { Result } from '@app/web/libraries/result'
import type { BeneficiaireId } from '../beneficiaire-id'
import type { AucunBeneficiaireValide } from '../errors'
import type { MediateurId } from '../mediateur-id'

export type SupprimerBeneficiaires = (input: {
  ids: readonly BeneficiaireId[]
  mediateurId: MediateurId
}) => Promise<Result<{ deleted: number }, AucunBeneficiaireValide>>
