import type { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { ChoixApresRupture } from './choix-apres-rupture'
import {
  AucuneRuptureEnAttente,
  type EchecDeChoisirLaVisibiliteApresRupture,
} from './errors'
import type { ChoisirLaVisibiliteApresRupturePorts } from './ports'
import {
  type ReponseApresRupture,
  visibiliteApres,
} from './reponse-apres-rupture'
import { ruptureDuMediateur } from './rupture-du-mediateur'

export const choisirLaVisibiliteApresRupture =
  ({
    lireMediateurEtContrats,
    enregistrer,
  }: ChoisirLaVisibiliteApresRupturePorts) =>
  async ({
    mediateurId,
    reponse,
    auteurId,
    maintenant,
  }: {
    readonly mediateurId: MediateurId
    readonly reponse: ReponseApresRupture
    readonly auteurId: AuteurId
    readonly maintenant: Date
  }): Promise<
    Result<ChoixApresRupture, EchecDeChoisirLaVisibiliteApresRupture>
  > => {
    const enAttente = ruptureDuMediateur({
      mediateurId,
      mediateur: await lireMediateurEtContrats(mediateurId),
      maintenant,
    })

    if (!enAttente.success) return enAttente

    const { mediateur, rupture } = enAttente.data
    const choix: ChoixApresRupture = {
      mediateurId: mediateur.id,
      choixPrecedentLe: mediateur.visibiliteChoisieLe,
      reponse,
      visible: visibiliteApres(reponse),
      rupture,
      auteurId,
      choisiLe: maintenant,
    }

    const { enregistre } = await enregistrer(choix)

    return enregistre
      ? success(choix)
      : failure(AucuneRuptureEnAttente(mediateurId))
  }
