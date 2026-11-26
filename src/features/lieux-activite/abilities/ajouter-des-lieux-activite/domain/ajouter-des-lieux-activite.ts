import { type Result, success } from '@/libraries/result'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { AjoutDeLieux, LieuxAjoutes } from './ajout-de-lieux'
import { demandeDAjout } from './demande-d-ajout'
import type { EchecDeAjouterDesLieuxActivite } from './errors'
import { identifiantsCarto } from './identifiants-carto'
import type { LieuDemande } from './lieu-demande'
import { lieuxAMaterialiser } from './lieux-a-materialiser'
import type { AjouterDesLieuxActivitePorts } from './ports'

export const ajouterDesLieuxActivite =
  ({
    lireLieuxDejaRattaches,
    trouverStructuresCarto,
    rattacherAuxLieux,
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
        lieux,
        structuresCarto: new Map(),
        ajouteLe: maintenant,
        lieuxRattaches: [],
      })

    const ajout: AjoutDeLieux = {
      utilisateurId,
      mediateurId: demande.data.mediateurId,
      lieux,
      structuresCarto: await trouverStructuresCarto(identifiantsCarto(lieux)),
      ajouteLe: maintenant,
    }

    return success({ ...ajout, lieuxRattaches: await rattacherAuxLieux(ajout) })
  }
