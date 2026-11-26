import { failure, type Result, success } from '@/libraries/result'
import { LieuIntrouvable } from '../../../domain/errors'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { AjoutDeLieux, LieuxAjoutes } from './ajout-de-lieux'
import { demandeDAjout } from './demande-d-ajout'
import type { EchecDeAjouterDesLieuxActivite } from './errors'
import { identifiantsCarto } from './identifiants-carto'
import type { LieuDemande } from './lieu-demande'
import { lieuxAMaterialiser } from './lieux-a-materialiser'
import { planifierLesRattachements } from './planifier-les-rattachements'
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
    readonly demandes: readonly LieuDemande[]
    readonly utilisateurId: UtilisateurId
    readonly mediateurId: MediateurId | null
    readonly maintenant: Date
  }): Promise<Result<LieuxAjoutes, EchecDeAjouterDesLieuxActivite>> => {
    const demande = demandeDAjout({ mediateurId, demandes })

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
