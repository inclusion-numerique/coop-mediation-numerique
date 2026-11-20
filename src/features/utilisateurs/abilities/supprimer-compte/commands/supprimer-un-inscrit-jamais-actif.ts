import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { success } from '@/libraries/result'
import { RetentionPolicy, type SupprimerComptePorts } from '../domain'
import { supprimerCompte } from './supprimer-compte'

export const supprimerUnInscritJamaisActif =
  (ports: SupprimerComptePorts, maintenant: Date) =>
  async (utilisateurId: UtilisateurId) => {
    const resultat = await supprimerCompte({
      command: {
        cible: utilisateurId,
        auteur: {
          _tag: 'systeme',
          policy: RetentionPolicy('InscritJamaisActif'),
        },
        maintenant,
      },
      ports,
    })
    return resultat.success ? success(undefined) : resultat
  }
