import { failure, type Result, success } from '@/libraries/result'
import type {
  DestinationDuLieu,
  LieuCandidatCoop,
} from '../../../domain/destination-du-lieu'
import { LieuIntrouvable } from '../../../domain/errors'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import {
  AUCUN_LIEU_PREVU,
  type LieuxPrevus,
  reconnaitreLeLieu,
} from '../../../domain/reconnaitre-le-lieu'
import type { CreationDemandee } from './destination-du-lieu'
import { type LieuCarto, lieuDepuisCarto } from './lieu-carto'
import { estExistant, type LieuACreer, type LieuDemande } from './lieu-demande'
import type { PlanifierLesRattachementsPorts } from './ports'

type Plan = {
  readonly destinations: readonly DestinationDuLieu<CreationDemandee>[]
  readonly prevus: LieuxPrevus
}

const lieuAReconnaitre = (
  { nom, adresse, localisation }: LieuACreer,
  lieuCarto: LieuCarto | undefined,
): Omit<LieuCandidatCoop, 'id' | 'suppression'> => ({
  nom: lieuCarto?.fiche.nom ?? nom,
  adresse: adresse.voie,
  commune: adresse.commune,
  codePostal: adresse.code_postal,
  codeInsee: adresse.code_insee ?? null,
  latitude: localisation.latitude,
  longitude: localisation.longitude,
  typologies: lieuCarto?.fiche.typologies ?? null,
})

const ajouter = (
  plan: Plan,
  destination: DestinationDuLieu<CreationDemandee>,
  prevus: LieuxPrevus,
): Result<Plan, LieuIntrouvable> =>
  success({ destinations: [...plan.destinations, destination], prevus })

const releve = (prevus: LieuxPrevus, id: LieuId): LieuxPrevus => ({
  ...prevus,
  releves: [...prevus.releves, id],
})

const cree = (
  prevus: LieuxPrevus,
  candidat: LieuCandidatCoop,
): LieuxPrevus => ({ ...prevus, crees: [...prevus.crees, candidat] })

const lieuDeLaCarto = (
  lieu: LieuDemande,
  structuresCarto: ReadonlyMap<string, LieuCarto>,
): LieuCarto | undefined =>
  lieu.structureCartographieNationaleId == null
    ? undefined
    : structuresCarto.get(lieu.structureCartographieNationaleId)

export const planifierLesRattachements =
  ({
    etatDuLieu,
    lieuPorteurDeLaCarto,
    lieuxAuMemeEndroit,
    nouvelIdentifiantDeLieu,
  }: PlanifierLesRattachementsPorts) =>
  async ({
    lieux,
    structuresCarto,
    maintenant,
  }: {
    readonly lieux: readonly LieuDemande[]
    readonly structuresCarto: ReadonlyMap<string, LieuCarto>
    readonly maintenant: Date
  }): Promise<
    Result<readonly DestinationDuLieu<CreationDemandee>[], LieuIntrouvable>
  > => {
    const reconnaitre = reconnaitreLeLieu(lieuxAuMemeEndroit)

    const planifier = async (
      plan: Plan,
      lieu: LieuDemande,
    ): Promise<Result<Plan, LieuIntrouvable>> => {
      const etat = estExistant(lieu) ? await etatDuLieu(lieu.id) : null

      if (estExistant(lieu) && etat === 'Actif')
        return ajouter(plan, { _tag: 'LieuActif', id: lieu.id }, plan.prevus)

      const porteur =
        lieu.structureCartographieNationaleId == null
          ? null
          : await lieuPorteurDeLaCarto(lieu.structureCartographieNationaleId)

      if (porteur !== null)
        return ajouter(plan, { _tag: 'LieuActif', id: porteur }, plan.prevus)

      if (estExistant(lieu) && etat === 'Inactif')
        return ajouter(
          plan,
          { _tag: 'LieuARelever', id: lieu.id },
          releve(plan.prevus, lieu.id),
        )

      if (estExistant(lieu)) return failure(LieuIntrouvable(lieu.id))

      const lieuCarto = lieuDeLaCarto(lieu, structuresCarto)
      const aReconnaitre = lieuAReconnaitre(lieu, lieuCarto)
      const connu = await reconnaitre({ aReconnaitre, prevus: plan.prevus })

      if (connu !== null)
        return ajouter(
          plan,
          connu,
          connu._tag === 'LieuARelever'
            ? releve(plan.prevus, connu.id)
            : plan.prevus,
        )

      const id = nouvelIdentifiantDeLieu()

      return ajouter(
        plan,
        {
          _tag: 'LieuACreer',
          id,
          creation: {
            demande: lieu,
            carto:
              lieuCarto === undefined
                ? null
                : lieuDepuisCarto(lieuCarto, maintenant, id),
          },
        },
        cree(plan.prevus, { ...aReconnaitre, id, suppression: null }),
      )
    }

    const plan = await lieux.reduce<Promise<Result<Plan, LieuIntrouvable>>>(
      async (precedent, lieu) => {
        const resolu = await precedent
        return resolu.success ? planifier(resolu.data, lieu) : resolu
      },
      Promise.resolve(success({ destinations: [], prevus: AUCUN_LIEU_PREVU })),
    )

    return plan.success ? success(plan.data.destinations) : plan
  }
