import { prismaClient } from '@/configuration/prisma'
import {
  type ActiviteConsultee,
  type ActiviteId,
  type MediateurId,
  RdvId,
} from '../../domain'
import {
  activiteConsulteeDe,
  activiteConsulteeSelect,
  rdvIdsDes,
} from './activite-consultee.transfer'
import type { RendezVousLies } from './rendez-vous-fournis.transfer'

export const lireUneActiviteDeMediation = async ({
  id,
  mediateurId,
  rendezVousLies,
}: {
  readonly id: ActiviteId
  readonly mediateurId: MediateurId
  readonly rendezVousLies: RendezVousLies
}): Promise<ActiviteConsultee | null> => {
  const ligne = await prismaClient.activite.findFirst({
    where: { id, mediateurId, suppression: null },
    select: activiteConsulteeSelect,
  })
  if (ligne === null) return null
  return activiteConsulteeDe(
    ligne,
    await rendezVousLies(rdvIdsDes([ligne]).map(RdvId)),
  )
}
