import { geocoder } from '@/configuration/ban'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { rattacherUneSaisie } from '../domain/rattacher-une-saisie'
import { etablissementDepuisSiret } from './api/etablissement-depuis-siret'
import { rattacherAUneEmployeuse } from './prisma/rattacher-a-une-employeuse.mutation'
import { rattacherAUneEmployeuseDepuisSiret } from './prisma/rattacher-depuis-siret.mutation'

const services = {
  geocoder,
  signaler,
  etablissementDepuisSiret,
}

export const rattacherAUneEmployeuseBinding = rattacherAUneEmployeuse(services)

export const rattacherAUneEmployeuseSaisieBinding = rattacherUneSaisie(
  rattacherAUneEmployeuseBinding,
)

export const rattacherAUneEmployeuseDepuisSiretBinding =
  rattacherAUneEmployeuseDepuisSiret(services)
