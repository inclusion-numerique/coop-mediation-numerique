import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import * as Sentry from '@sentry/nextjs'
import { etablissementDepuisSiret } from './api/etablissement-depuis-siret'
import { rattacherAUneEmployeuse } from './prisma/rattacher-a-une-employeuse.mutation'
import { rattacherAUneEmployeuseDepuisSiret } from './prisma/rattacher-depuis-siret.mutation'

const services = {
  geocoder: searchAdresse,
  signaler: (erreur: unknown) => Sentry.captureException?.(erreur),
  etablissementDepuisSiret,
}

export const rattacherAUneEmployeuseBinding = rattacherAUneEmployeuse(services)

export const rattacherAUneEmployeuseDepuisSiretBinding =
  rattacherAUneEmployeuseDepuisSiret(services)
