import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { lireUneActiviteDeMediation } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif'
import { formulaireDeLAtelierCollectif } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/formulaire-de-l-atelier-collectif.presenter'
import { ActiviteId, MediateurId } from '@app/web/features/activites/domain'
import RattacherEmployeusePage from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/server'
import { rendezVousLies } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { notFound, redirect } from 'next/navigation'

const DupliquerPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const user = await authenticateMediateur()

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  if (!employeuse) {
    return <RattacherEmployeusePage motif="Enregistrer une activité" />
  }

  const activiteId = ActiviteId.safe(id)
  const aModifier =
    activiteId === null
      ? null
      : await lireUneActiviteDeMediation({
          id: activiteId,
          mediateurId: MediateurId(user.mediateur.id),
          rendezVousLies,
        })

  if (aModifier?.activite._tag !== 'Collectif') return notFound()

  const defaultValues = formulaireDeLAtelierCollectif(
    aModifier.activite,
    aModifier.affichage,
  )

  const defaultValuesWithoutIds = {
    ...defaultValues,
    id: undefined,
    rdvServicePublicId: undefined,
    participantsAnonymes: defaultValues.participantsAnonymes
      ? { ...defaultValues.participantsAnonymes, id: undefined }
      : undefined,
  }

  return redirect(
    `/coop/mes-activites/cra/collectif?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutIds)}`,
  )
}

export default DupliquerPage
