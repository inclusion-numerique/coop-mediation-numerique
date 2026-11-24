import { adresseAvec } from '@/libraries/parametres-d-url'

const CHEMIN = '/administration/utilisateurs/export'

export const lienDExport = (
  parametres: Readonly<Record<string, string>>,
  recherche: string | null,
): string => adresseAvec(CHEMIN, { ...parametres, recherche })
