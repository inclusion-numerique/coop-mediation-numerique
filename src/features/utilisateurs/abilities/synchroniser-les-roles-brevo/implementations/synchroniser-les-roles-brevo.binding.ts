import { synchroniserLesRolesBrevo as synchroniser } from '../domain/synchroniser-les-roles-brevo'
import { listeDeDiffusionPorts } from './brevo/liste-de-diffusion.mutation'
import { inscritsDeLaListe } from './prisma/inscrits-de-la-liste.query'

export const synchroniserLesRolesBrevo = synchroniser({
  ...listeDeDiffusionPorts,
  lireLesInscrits: inscritsDeLaListe,
})
