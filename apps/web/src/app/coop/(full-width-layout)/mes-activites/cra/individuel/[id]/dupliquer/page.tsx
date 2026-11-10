import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { lireUneActiviteDeMediation } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel'
import { formulaireDeLAccompagnementIndividuel } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/formulaire-de-l-accompagnement-individuel.presenter'
import { ActiviteId, MediateurId } from '@app/web/features/activites/domain'
import RattacherEmployeusePage from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/server'
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
  const mediateurId = user.mediateur.id

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
          mediateurId: MediateurId(mediateurId),
        })

  if (aModifier?.activite._tag !== 'Individuel') return notFound()

  const defaultValues = formulaireDeLAccompagnementIndividuel(
    aModifier.activite,
    aModifier.affichage,
  )

  const defaultValuesWithoutId = {
    ...defaultValues,
    id: undefined,
    rdvServicePublicId: undefined, // the rdvServicePublicId is not duplicated as it is "owned" by the duplicated activite
  }

  return redirect(
    `/coop/mes-activites/cra/individuel?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutId)}`,
  )
}

export default DupliquerPage
