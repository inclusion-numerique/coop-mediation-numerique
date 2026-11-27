import { toTitleCase } from '@/libraries/texte'
import type { FusionApercue } from '../../domain'
import { nomAffiche } from './nom-affiche.presenter'

export const lieuChoisiParDefaut = ({ mergeSource }: FusionApercue) => ({
  id: mergeSource.id,
  nom: nomAffiche(mergeSource.nom),
  adresse: toTitleCase(mergeSource.adresse?.voie ?? '', { noUpper: true }),
  commune: toTitleCase(mergeSource.adresse?.commune ?? ''),
  codePostal: mergeSource.adresse?.code_postal ?? '',
})
