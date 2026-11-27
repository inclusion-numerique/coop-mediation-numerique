import {
  contactAInscrire,
  type InscriptionALaListe,
  inscriptionALaListe,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { type Result, success } from '@/libraries/result'
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
    const inscription = inscriptionALaListe(
      contactAInscrire(await lireLInscritAInscrire(utilisateurId)),
    )

    if (inscription._tag === 'ContactInscrit')
      await importerLeContact(inscription.contact)

    return success(inscription)
  }
