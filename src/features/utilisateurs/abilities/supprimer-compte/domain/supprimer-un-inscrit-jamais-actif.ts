import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { success } from '@/libraries/result'
import type { SupprimerCompteDependances } from './ports'
import { RetentionPolicy } from './retention-policy'
import { supprimerCompte } from './supprimer-compte'

export const supprimerUnInscritJamaisActif =
  (dependances: SupprimerCompteDependances, maintenant: Date) =>
  async (utilisateurId: UtilisateurId) => {
    const resultat = await supprimerCompte(dependances)({
      cible: utilisateurId,
      auteur: {
        _tag: 'systeme',
        policy: RetentionPolicy('InscritJamaisActif'),
      },
      maintenant,
    })
    return resultat.success ? success(undefined) : resultat
  }
