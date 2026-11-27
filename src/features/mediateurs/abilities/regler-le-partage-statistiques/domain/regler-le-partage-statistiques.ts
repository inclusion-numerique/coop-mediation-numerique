import type {
  AuteurId,
  PerimetrePartage,
  Rattachements,
} from '@/features/mediateurs/domain'
import { type Result, success } from '@/libraries/result'
import type { EchecDeReglerLePartageStatistiques } from './errors'
import type { ReglerLePartageStatistiquesPorts } from './ports'
import { proprietaireChoisi } from './proprietaire-choisi'
import type { ReglageDuPartage } from './reglage-du-partage'

export const reglerLePartageStatistiques =
  ({ enregistrer }: ReglerLePartageStatistiquesPorts) =>
  async ({
    rattachements,
    perimetre,
    actif,
    auteurId,
    maintenant,
  }: {
    readonly rattachements: Rattachements
    readonly perimetre: PerimetrePartage
    readonly actif: boolean
    readonly auteurId: AuteurId
    readonly maintenant: Date
  }): Promise<Result<ReglageDuPartage, EchecDeReglerLePartageStatistiques>> => {
    const proprietaire = proprietaireChoisi(rattachements, perimetre)
    if (!proprietaire.success) return proprietaire

    const reglage: ReglageDuPartage = {
      proprietaire: proprietaire.data,
      actif,
      auteurId,
      regleLe: maintenant,
    }

    await enregistrer(reglage)

    return success(reglage)
  }
