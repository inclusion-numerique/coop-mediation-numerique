import {
  CoordinateurId,
  MediateurId,
  rattachements,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import {
  type Activation,
  activationDe,
  type NonCoordinateur,
} from './mediation'

type CompteQuiActive = {
  readonly id: string
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}

export type ActiverLaMediationNumeriquePorts = {
  readonly lireLeCompteQuiActive: (
    utilisateurId: string,
  ) => Promise<CompteQuiActive | null>
  readonly activer: (activation: {
    readonly utilisateurId: string
    readonly coordinateurId: string
  }) => Promise<unknown>
  readonly inscrireALaListeDeDiffusion: (utilisateurId: string) => Promise<void>
}

export const activerLaMediationNumerique =
  ({
    lireLeCompteQuiActive,
    activer,
    inscrireALaListeDeDiffusion,
  }: ActiverLaMediationNumeriquePorts) =>
  async (
    utilisateurId: string,
  ): Promise<Result<Activation, UtilisateurIntrouvable | NonCoordinateur>> => {
    const compte = await lireLeCompteQuiActive(utilisateurId)
    if (compte === null) return failure(UtilisateurIntrouvable(utilisateurId))

    const activation = activationDe(
      rattachements(
        compte.mediateur === null ? null : MediateurId(compte.mediateur.id),
        compte.coordinateur === null
          ? null
          : CoordinateurId(compte.coordinateur.id),
      ),
    )
    if (!activation.success) return activation
    if (activation.data._tag === 'DejaActivee') return success('DejaActivee')

    await activer({
      utilisateurId: compte.id,
      coordinateurId: activation.data.coordinateurId,
    })
    await inscrireALaListeDeDiffusion(compte.id)

    return success('AActiver')
  }
