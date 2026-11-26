import {
  contactAInscrire,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { type Result, success } from '@/libraries/result'
import type { InscriptionALaListe } from './inscription-a-la-liste'
import type { InscrireALaListeDeDiffusionPorts } from './ports'

export const inscrireALaListeDeDiffusion =
  ({
    lireLInscritAInscrire,
    importerLeContact,
  }: InscrireALaListeDeDiffusionPorts) =>
  async ({
    utilisateurId,
  }: {
    readonly utilisateurId: UtilisateurId
  }): Promise<Result<InscriptionALaListe, never>> => {
    const contact = contactAInscrire(await lireLInscritAInscrire(utilisateurId))

    if (contact === null) return success({ _tag: 'SansContactAInscrire' })

    await importerLeContact(contact)

    return success({ _tag: 'ContactInscrit', contact })
  }
