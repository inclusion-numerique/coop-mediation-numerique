import { failure, type Result, success } from '@/libraries/result'
import { LieuIntrouvable } from '../../../domain/errors'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import { planifierLesRattachements } from '../../../domain/rattachement/planifier-les-rattachements'
import type { AjoutDeLieux, LieuxAjoutes } from './ajout-de-lieux'
import { demandeDAjout } from './demande-d-ajout'
import type { EchecDeAjouterDesLieuxActivite } from './errors'
import { identifiantsCarto } from './identifiants-carto'
import { type LieuSoumis, lieuxDemandes } from './lieu-soumis'
import { lieuxAMaterialiser } from './lieux-a-materialiser'
import type { AjouterDesLieuxActivitePorts } from './ports'

export const ajouterDesLieuxActivite =
  ({
    lireLieuxDejaRattaches,
    trouverStructuresCarto,
    rattacherAuxLieux,
    ...portsDePlanification
  }: AjouterDesLieuxActivitePorts) =>
  async ({
    demandes,
    utilisateurId,
    mediateurId,
    maintenant,
  }: {
    readonly demandes: readonly LieuSoumis[]
    readonly utilisateurId: UtilisateurId
    readonly mediateurId: MediateurId | null
    readonly maintenant: Date
  }): Promise<Result<LieuxAjoutes, EchecDeAjouterDesLieuxActivite>> => {
    const demandesSituees = lieuxDemandes(demandes)

    if (!demandesSituees.success) return demandesSituees

    const demande = demandeDAjout({
      mediateurId,
      demandes: demandesSituees.data,
    })

    if (!demande.success) return demande

    const lieux = lieuxAMaterialiser(
      await lireLieuxDejaRattaches(demande.data.mediateurId),
      demande.data.demandes,
    )

    if (lieux.length === 0)
      return success({
        utilisateurId,
        mediateurId: demande.data.mediateurId,
        destinations: [],
        ajouteLe: maintenant,
        lieuxRattaches: [],
      })

    const destinations = await planifierLesRattachements(portsDePlanification)({
      lieux,
      structuresCarto: await trouverStructuresCarto(identifiantsCarto(lieux)),
      maintenant,
    })

    if (!destinations.success) return destinations

    const ajout: AjoutDeLieux = {
      utilisateurId,
      mediateurId: demande.data.mediateurId,
      destinations: destinations.data,
      ajouteLe: maintenant,
    }

    const rattachement = await rattacherAuxLieux(ajout)

    if (rattachement._tag === 'LieuDisparu')
      return failure(LieuIntrouvable(rattachement.lieuId))

    return success({
      ...ajout,
      lieuxRattaches: destinations.data.map(({ id }) => id),
    })
  }
