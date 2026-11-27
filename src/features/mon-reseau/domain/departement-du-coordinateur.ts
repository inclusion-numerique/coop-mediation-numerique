import {
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@/libraries/departement'
import type { CodeDepartement } from '@/libraries/insee'
import type { CoordinateurDeLActeur } from './acteur'

export const departementDuCoordinateur = ({
  communeDeLEmployeuse,
}: Pick<CoordinateurDeLActeur, 'communeDeLEmployeuse'>): CodeDepartement =>
  departementDeLActeur({ employeuse: communeDeLEmployeuse, lieux: [] }) ??
  DEPARTEMENT_PAR_DEFAUT
