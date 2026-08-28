import {
  IdentiteEmployeuse,
  rattacherAUneEmployeuse,
} from '@app/web/features/employeuse/server'
import type { RattacherEmployeuse } from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/domain'

/**
 * Implémentation ACL : traduit le choix du formulaire en identité d'employeuse
 * et délègue tout le rattachement à la feature employeuse, seule autorité sur
 * l'écriture — création ou réutilisation de la structure, rupture du
 * rattachement précédent, pose du nouveau, le tout en transaction.
 *
 * L'inscription ne réimplémente rien de cette orchestration : elle n'en retient
 * que l'issue, parce que c'est tout ce dont sa propre décision dépend.
 */
export const rattacherEmployeuse: RattacherEmployeuse = async ({
  userId,
  structureEmployeuse,
}) => {
  // Forme totale : une structure sans SIRET ni commune n'est pas rattachable. La
  // dénomination, elle, peut manquer (établissement non diffusible, entreprise
  // individuelle) — d'où le repli sur `null` plutôt qu'une chaîne vide, que le
  // modèle refuserait.
  const identite = IdentiteEmployeuse.safe({
    siret: structureEmployeuse.siret,
    denomination: structureEmployeuse.nom || null,
    adresse: {
      voie: structureEmployeuse.adresse.nom,
      commune: structureEmployeuse.adresse.commune,
      codePostal: structureEmployeuse.adresse.codePostal || null,
      codeInsee: structureEmployeuse.adresse.codeInsee || null,
    },
  })

  if (!identite) return 'indisponible'

  const rattachement = await rattacherAUneEmployeuse({ userId, identite })

  return rattachement._tag === 'rattachee' ? 'rattachee' : 'indisponible'
}
