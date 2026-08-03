export type {
  RattachementEmployeuse,
  RattacherAUneEmployeuse,
  RattacherAUneEmployeuseDepuisSiret,
} from './domain'
export {
  adresseMainKey,
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
  ensurePersonneMain,
  ensureStructureAdministrativeMain,
  findAdresseMainId,
  insertAdresseMain,
  rattacherAUneEmployeuse,
  rattacherAUneEmployeuseDepuisSiret,
  resolveAdresseMain,
  resolveIdentiteFromSiret,
} from './implementation'
