import { prismaClient } from '@app/web/prismaClient'
import { createCraDataFromRdv } from '@app/web/rdv-service-public/createCraDataFromRdv'
import { getServerUrl } from '@app/web/utils/baseUrl'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import type { PreparerUrlCreationCra } from '../../domain/creer-activite-depuis-rdv'

/**
 * Adaptateur vers la feature activités : traduit un rendez-vous en formulaire de
 * CRA pré-rempli.
 *
 * La forme de ce pré-remplissage — durée adaptée aux habitudes du médiateur,
 * individuel ou collectif, participants — appartient aux activités, pas à RDV
 * Service Public. L'ability n'en connaît que l'URL rendue. La relecture du
 * rendez-vous est assumée : chaque couche lit ce dont elle a besoin, plutôt que
 * de convoyer une forme intermédiaire qui appartiendrait aux deux.
 */
export const preparerUrlCreationCra: PreparerUrlCreationCra = async ({
  rdvId,
  mediateurId,
  beneficiaires,
}) => {
  const rdv = await prismaClient.rdv.findUniqueOrThrow({
    where: { id: rdvId },
    select: {
      id: true,
      name: true,
      durationInMin: true,
      startsAt: true,
      endsAt: true,
      maxParticipantsCount: true,
      collectif: true,
      motif: { select: { name: true, collectif: true } },
      organisation: { select: { id: true, name: true } },
    },
  })

  const { type, defaultValues } = await createCraDataFromRdv({
    rdv,
    mediateurId,
    beneficiaires: [...beneficiaires],
  })

  return getServerUrl(
    `/coop/mes-activites/cra/${type}?v=${encodeSerializableState(defaultValues)}`,
    { absolutePath: true },
  )
}
