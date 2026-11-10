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

  // Une activité s'exerce forcément quelque part : sans employeuse, on demande
  // laquelle plutôt que d'enregistrer un CRA rattaché à personne. Le cas type
  // est la fin d'un contrat de conseiller numérique — l'Entrepôt clôt
  // l'affectation, la personne reste médiatrice.
  //
  // La garde pose EXACTEMENT la question que posera l'écriture
  // (`createOrUpdateActivite`), et non celle, plus étroite, de la session :
  // `user.emplois` ne connaît que l'affectation active, quand l'ability
  // reconnaît aussi le contrat qui couvre la date. Sans cela, les personnes que
  // seul leur contrat rattache seraient renvoyées vers ce formulaire alors que
  // leur CRA se serait rattaché sans elles.
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
