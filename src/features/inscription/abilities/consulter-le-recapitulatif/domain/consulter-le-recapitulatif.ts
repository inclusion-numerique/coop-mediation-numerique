import type {
  ProfilInscription,
  UtilisateurId,
} from '@/features/inscription/domain'
import { type Result, success } from '@/libraries/result'
import type { ConsulterLeRecapitulatifPorts } from './ports'
import type { Recapitulatif } from './recapitulatif'

const coordonne = (profil: ProfilInscription | null): boolean =>
  profil === 'Coordinateur' || profil === 'CoordinateurConseillerNumerique'

export const consulterLeRecapitulatif =
  <Lieu>({
    lireLInscritARecapituler,
    listerLesLieux,
    compterLesMediateursCoordonnes,
  }: ConsulterLeRecapitulatifPorts<Lieu>) =>
  async ({
    utilisateurId,
  }: {
    readonly utilisateurId: UtilisateurId
  }): Promise<Result<Recapitulatif<Lieu>, never>> => {
    const { profil, mediateurId, aUnCompteCoordinateur, lieuxImportesLe } =
      await lireLInscritARecapituler(utilisateurId)

    const [lieuxActivite, nombreDeMediateursCoordonnes] = await Promise.all([
      mediateurId === null || coordonne(profil)
        ? []
        : listerLesLieux({ mediateurId }),
      aUnCompteCoordinateur
        ? compterLesMediateursCoordonnes(utilisateurId)
        : null,
    ])

    return success({
      lieuxActivite,
      nombreDeMediateursCoordonnes,
      lieuxImportesLe,
    })
  }
