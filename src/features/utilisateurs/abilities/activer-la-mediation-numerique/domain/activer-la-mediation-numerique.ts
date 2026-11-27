import {
  contactAInscrire,
  inscriptionALaListe,
  type UtilisateurId,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDActiverLaMediationNumerique } from './errors'
import { type Activation, activationDe } from './mediation'
import type { ActiverLaMediationNumeriquePorts } from './ports'

export const activerLaMediationNumerique =
  ({
    lireLeCompteQuiActive,
    activer,
    lireLInscritAInscrire,
    inscrireALaListeDeDiffusion,
  }: ActiverLaMediationNumeriquePorts) =>
  async ({
    utilisateurId,
  }: {
    readonly utilisateurId: UtilisateurId | null
  }): Promise<Result<Activation, EchecDActiverLaMediationNumerique>> => {
    if (utilisateurId === null) return failure(UtilisateurIntrouvable())

    const compte = await lireLeCompteQuiActive(utilisateurId)
    if (compte === null) return failure(UtilisateurIntrouvable())

    const activation = activationDe(compte.rattachements)
    if (!activation.success) return activation
    if (activation.data._tag === 'DejaActivee')
      return success({ _tag: 'DejaActivee' })

    const { coordinateurId } = activation.data
    await activer({ utilisateurId: compte.id, coordinateurId })

    const inscription = inscriptionALaListe(
      contactAInscrire(await lireLInscritAInscrire(compte.id)),
    )
    if (inscription._tag === 'ContactInscrit')
      await inscrireALaListeDeDiffusion(inscription.contact)

    return success({
      _tag: 'Activee',
      utilisateurId: compte.id,
      coordinateurId,
      inscription,
    })
  }
