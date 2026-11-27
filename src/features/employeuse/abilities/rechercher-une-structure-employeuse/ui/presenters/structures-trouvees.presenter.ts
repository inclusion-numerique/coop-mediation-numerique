import { toTitleCase } from '@/libraries/texte'
import type {
  EmployeuseAvecSiret,
  StructuresTrouvees,
  StructureTrouvee,
} from '../../domain/structures-trouvees'

const employeuseAffichee = ({
  id,
  denomination,
  adresse,
  siret,
}: EmployeuseAvecSiret) => ({
  id: String(id),
  nom: denomination ?? '',
  adresse: toTitleCase(adresse?.voie ?? '', { noUpper: true }),
  commune: toTitleCase(adresse?.commune ?? ''),
  codePostal: adresse?.codePostal ?? '',
  codeInsee: adresse?.codeInsee ?? '',
  siret,
  typologie: null,
  source: 'database' as const,
})

const structureAffichee = <Etablissement>(
  structure: StructureTrouvee<Etablissement>,
) =>
  structure._tag === 'DeLaCoop'
    ? employeuseAffichee(structure.employeuse)
    : structure.etablissement

export const structuresTrouveesAffichees = <Etablissement>({
  structures,
  ...trouvees
}: StructuresTrouvees<Etablissement>) => ({
  ...trouvees,
  structures: structures.map(structureAffichee),
})
