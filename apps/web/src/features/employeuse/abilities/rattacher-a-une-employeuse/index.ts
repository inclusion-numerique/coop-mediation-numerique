export type {
  RattachementEmployeuse,
  RattacherAUneEmployeuse,
  RattacherAUneEmployeuseDepuisSiret,
} from './domain'
export {
  adresseMainKey,
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
  ensureStructureAdministrativeMain,
  findAdresseMainId,
  insertAdresseMain,
  rattacherAUneEmployeuse,
  rattacherAUneEmployeuseDepuisSiret,
  resolveAdresseMain,
  resolveIdentiteFromSiret,
} from './implementation'
