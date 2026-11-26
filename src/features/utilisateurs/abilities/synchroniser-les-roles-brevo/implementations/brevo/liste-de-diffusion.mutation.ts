import {
  importerDansLaListe,
  retirerDeLaListe,
} from '@/features/utilisateurs/implementations/brevo/liste-de-diffusion.mutation'
import {
  type EchecTechnique,
  enEchecTechnique,
  failure,
  success,
} from '@/libraries/result'
import {
  IdentifiantDImport,
  type SynchroniserLesRolesBrevoPorts,
  TailleDeLot,
} from '../../domain'

const echecDe = (erreur: unknown): EchecTechnique => enEchecTechnique(erreur)

export const TAILLE_DES_IMPORTS_BREVO = TailleDeLot(1000)

export const TAILLE_DES_RETRAITS_BREVO = TailleDeLot(150)

export const importerUnLot: SynchroniserLesRolesBrevoPorts['importerUnLot'] =
  async (lot) => {
    try {
      return success(IdentifiantDImport(await importerDansLaListe(lot)))
    } catch (erreur) {
      return failure(echecDe(erreur))
    }
  }

export const retirerUnLot: SynchroniserLesRolesBrevoPorts['retirerUnLot'] =
  async (lot) => {
    try {
      await retirerDeLaListe(lot)
      return success(undefined)
    } catch (erreur) {
      return failure(echecDe(erreur))
    }
  }
