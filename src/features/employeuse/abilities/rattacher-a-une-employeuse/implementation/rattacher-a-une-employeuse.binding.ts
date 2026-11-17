import { geocoder } from '@app/web/configuration/ban'
import { signaler } from '@app/web/configuration/telemetry/error-reporter/server/signaler'
import { etablissementDepuisSiret } from './api/etablissement-depuis-siret'
import { rattacherAUneEmployeuse } from './prisma/rattacher-a-une-employeuse.mutation'
import { rattacherAUneEmployeuseDepuisSiret } from './prisma/rattacher-depuis-siret.mutation'

const services = {
  geocoder,
  signaler,
  etablissementDepuisSiret,
}

export const rattacherAUneEmployeuseBinding = rattacherAUneEmployeuse(services)

export const rattacherAUneEmployeuseDepuisSiretBinding =
  rattacherAUneEmployeuseDepuisSiret(services)
