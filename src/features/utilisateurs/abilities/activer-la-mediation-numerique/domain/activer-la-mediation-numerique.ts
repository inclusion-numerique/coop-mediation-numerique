import {
  type ContactAImporter,
  CoordinateurId,
  contactASynchroniser,
  type InscritDeLaListe,
  MediateurId,
  rattachements,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDActiverLaMediationNumerique } from './errors'
import { type Activation, activationDe } from './mediation'
import type { ActiverLaMediationNumeriquePorts } from './ports'

const contactAInscrire = (
  inscrit: InscritDeLaListe | null,
): ContactAImporter | null => {
  if (inscrit === null) return null
  const contact = contactASynchroniser(inscrit)
  return contact._tag === 'AImporter' ? contact.contact : null
}

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
    readonly utilisateurId: string
  }): Promise<Result<Activation, EchecDActiverLaMediationNumerique>> => {
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
    if (activation.data._tag === 'DejaActivee')
      return success({ _tag: 'DejaActivee' })

    const { coordinateurId } = activation.data
    await activer({ utilisateurId: compte.id, coordinateurId })

    const inscription = contactAInscrire(await lireLInscritAInscrire(compte.id))
    if (inscription !== null) await inscrireALaListeDeDiffusion(inscription)

    return success({
      _tag: 'Activee',
      utilisateurId: compte.id,
      coordinateurId,
      inscription,
    })
  }
