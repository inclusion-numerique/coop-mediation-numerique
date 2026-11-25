import { prismaClient } from '@/configuration/prisma'
import {
  type ActiviteConsultee,
  type MediateurId,
  RdvId,
} from '../../../../domain'
import {
  activiteConsulteeDe,
  activiteConsulteeSelect,
  rdvIdsDes,
} from '../../../../implementations/prisma/activite-consultee.transfer'
import type { RendezVousLies } from '../../../../implementations/prisma/rendez-vous-fournis.transfer'

const NOMBRE_DE_DERNIERES_ACTIVITES = 3

export const listerLesDernieresActivites = async ({
  mediateurId,
  rendezVousLies,
}: {
  readonly mediateurId: MediateurId
  readonly rendezVousLies: RendezVousLies
}): Promise<readonly ActiviteConsultee[]> => {
  const lignes = await prismaClient.activite.findMany({
    where: { mediateurId, suppression: null },
    select: activiteConsulteeSelect,
    orderBy: { creation: 'desc' },
    take: NOMBRE_DE_DERNIERES_ACTIVITES,
  })
  const lies = await rendezVousLies(rdvIdsDes(lignes).map(RdvId))
  return lignes.map((ligne) => activiteConsulteeDe(ligne, lies))
}
