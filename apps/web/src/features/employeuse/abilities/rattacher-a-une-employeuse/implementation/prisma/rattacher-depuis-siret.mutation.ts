import { identiteDepuisEtablissement } from '../../../../domain/identite-employeuse'
import type { RattacherAUneEmployeuseDepuisSiret } from '../../domain/rattacher-a-une-employeuse'
import { etablissementDepuisSiret } from '../api/etablissement-depuis-siret'
import { rattacherAUneEmployeuse } from './rattacher-a-une-employeuse.mutation'

/**
 * Rattachement à partir du seul SIRET : l'identité est résolue chez SIRENE.
 *
 * Deuxième porte d'entrée du même cas d'usage — ProConnect et le rattrapage
 * d'inscription n'ont que ce numéro à offrir, là où le formulaire apporte une
 * identité complète. Ce qui suit la résolution est strictement identique.
 */
export const rattacherAUneEmployeuseDepuisSiret: RattacherAUneEmployeuseDepuisSiret =
  async ({ userId, siret }) => {
    const etablissement = await etablissementDepuisSiret(siret)
    if (!etablissement) return { _tag: 'employeuseIndisponible' }

    const identite = identiteDepuisEtablissement(etablissement)
    if (!identite) return { _tag: 'identiteInexploitable' }

    return rattacherAUneEmployeuse({ userId, identite })
  }
