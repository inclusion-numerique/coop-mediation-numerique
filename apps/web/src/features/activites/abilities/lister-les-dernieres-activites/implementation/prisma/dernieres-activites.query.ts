import { prismaClient } from '@app/web/prismaClient'
import {
  activiteConsulteeDe,
  activiteConsulteeSelect,
  rdvIdsDes,
} from '../../../../db/activite-consultee.transfer'
import type { RendezVousLies } from '../../../../db/rendez-vous-fournis'
import {
  type ActiviteConsultee,
  type MediateurId,
  RdvId,
} from '../../../../domain'

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
