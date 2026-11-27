import {
  retirerLeContactDesListes,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { autoriserFusion, type FusionEffectuee } from './compte-a-fusionner'
import {
  CibleIntrouvable,
  type EchecDeFusionnerDesComptes,
  SourceIntrouvable,
} from './errors'
import type { FusionnerDesComptesPorts } from './ports'

export const fusionnerDesComptes =
  ({
    lireLesComptesAFusionner,
    fusionner,
    retirerLeContactDeLaListe,
    lireLaPresenceDuContact,
    supprimerLeContact,
  }: FusionnerDesComptesPorts) =>
  async ({
    sourceId,
    cibleId,
  }: {
    readonly sourceId: UtilisateurId | null
    readonly cibleId: UtilisateurId | null
  }): Promise<Result<FusionEffectuee, EchecDeFusionnerDesComptes>> => {
    if (sourceId === null) return failure(SourceIntrouvable())
    if (cibleId === null) return failure(CibleIntrouvable())

    const { source, cible } = await lireLesComptesAFusionner({
      sourceId,
      cibleId,
    })

    if (source === null) return failure(SourceIntrouvable())
    if (cible === null) return failure(CibleIntrouvable())

    const autorisation = autoriserFusion(source, cible)
    if (!autorisation.success) return autorisation

    await fusionner(autorisation.data)
    const retrait = await retirerLeContactDesListes({
      retirerLeContactDeLaListe,
      lireLaPresenceDuContact,
      supprimerLeContact,
    })({ courriel: source.courriel })

    return success({
      ...autorisation.data,
      retraitDeLaSource: retrait.success ? retrait.data : retrait.error,
    })
  }
