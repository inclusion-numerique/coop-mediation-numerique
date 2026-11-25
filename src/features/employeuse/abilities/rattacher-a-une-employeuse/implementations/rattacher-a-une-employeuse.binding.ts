import { geocoder } from '@/configuration/ban'
import { signaler } from '@/configuration/telemetry/serveur'
import { rattacherUneSaisie } from '../domain/rattacher-une-saisie'
import { etablissementDepuisSiret } from './api/etablissement-depuis-siret.query'
import {
  type RegistreDesPersonnes,
  rattacherAUneEmployeuse,
} from './prisma/rattacher-a-une-employeuse.mutation'
import { rattacherAUneEmployeuseDepuisSiret } from './prisma/rattacher-depuis-siret.mutation'

const services = {
  geocoder,
  signaler,
  etablissementDepuisSiret,
}

export const rattacherAUneEmployeuseBinding = (
  registre: RegistreDesPersonnes,
) => rattacherAUneEmployeuse({ ...services, ...registre })

export const rattacherAUneEmployeuseSaisieBinding = (
  registre: RegistreDesPersonnes,
) => rattacherUneSaisie(rattacherAUneEmployeuseBinding(registre))

export const rattacherAUneEmployeuseDepuisSiretBinding = (
  registre: RegistreDesPersonnes,
) => rattacherAUneEmployeuseDepuisSiret({ ...services, ...registre })
