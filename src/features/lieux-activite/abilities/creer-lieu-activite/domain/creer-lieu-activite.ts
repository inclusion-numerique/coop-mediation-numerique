import { failure, type Result, success } from '@/libraries/result'
import type { DestinationDuLieu } from '../../../domain/destination-du-lieu'
import { LieuIntrouvable, MediateurRequis } from '../../../domain/errors'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../domain/lieu'
import type { LieuAMaterialiser } from '../../../domain/lieu-identite'
import type { LieuxAuMemeEndroit } from '../../../domain/ports'
import {
  AUCUN_LIEU_PREVU,
  reconnaitreLeLieu,
} from '../../../domain/reconnaitre-le-lieu'
import { ecritureALaCreation } from '../../../domain/registre/ecriture-au-registre'
import type { EchecDeCreerLieuActivite } from './errors'
import type { LieuActiviteCree, LieuCree } from './lieu-cree'
import type { CreerLieuActivitePorts } from './ports'

const aReconnaitre = ({ fiche }: Lieu): LieuAMaterialiser | null =>
  fiche.adresse === null
    ? null
    : {
        nom: fiche.nom,
        adresse: fiche.adresse.voie,
        commune: fiche.adresse.commune,
        codePostal: fiche.adresse.code_postal,
        codeInsee: fiche.adresse.code_insee ?? null,
        latitude: fiche.localisation?.latitude ?? null,
        longitude: fiche.localisation?.longitude ?? null,
        typologies: fiche.typologies,
      }

const destinationDuLieu =
  (lieuxAuMemeEndroit: LieuxAuMemeEndroit) =>
  async (lieu: Lieu): Promise<DestinationDuLieu<Lieu>> => {
    const saisi = aReconnaitre(lieu)

    const connu =
      saisi === null
        ? null
        : await reconnaitreLeLieu(lieuxAuMemeEndroit)({
            aReconnaitre: saisi,
            prevus: AUCUN_LIEU_PREVU,
          })

    return connu ?? { _tag: 'LieuACreer', id: lieu.id, creation: lieu }
  }

export const creerLieuActivite =
  ({ lieuxAuMemeEndroit, enregistrer }: CreerLieuActivitePorts) =>
  async ({
    lieu,
    mediateurId,
    maintenant,
  }: {
    readonly lieu: Lieu
    readonly mediateurId: MediateurId | null
    readonly maintenant: Date
  }): Promise<Result<LieuActiviteCree, EchecDeCreerLieuActivite>> => {
    if (mediateurId == null) return failure(MediateurRequis())

    const creation: LieuCree = {
      destination: await destinationDuLieu(lieuxAuMemeEndroit)(lieu),
      mediateurId,
      debut: maintenant,
      par: lieu.tracabilite.creation.par,
      ecritureAuRegistre: ecritureALaCreation(lieu.visibilite),
    }

    const enregistrement = await enregistrer(creation)

    return enregistrement._tag === 'LieuDisparu'
      ? failure(LieuIntrouvable(enregistrement.lieuId))
      : success({ ...creation, rattachement: enregistrement.rattachement })
  }
