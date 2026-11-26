import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type BeneficiaireId,
  BeneficiaireIntrouvable,
  creationOuModification,
  ecrireLActiviteDeMediation,
  ecritureDe,
  enregistrementDeMediation,
  lieuVerifie,
  type MediateurId,
  origineDeLaSaisie,
  rendezVousHonore,
  rendezVousVerifie,
  TypeDActivite,
  tagsDeLaSaisie,
} from '../../../domain'
import type { EchecDEnregistrerUnAtelierCollectif } from './errors'
import type {
  EnregistrerUnAtelierCollectifPorts,
  NombreDeSuivisDuMediateur,
} from './ports'
import {
  type AtelierCollectifEnregistre,
  atelierDeLaSaisie,
  type SaisieCollective,
} from './saisie-collective'

const suivisVerifies =
  (nombreDeSuivisDuMediateur: NombreDeSuivisDuMediateur) =>
  async (
    suivis: readonly BeneficiaireId[],
    mediateurId: MediateurId,
  ): Promise<Result<null, BeneficiaireIntrouvable>> => {
    if (suivis.length === 0) return success(null)
    const trouves = await nombreDeSuivisDuMediateur({
      ids: suivis,
      mediateurId,
    })
    return trouves === new Set(suivis).size
      ? success(null)
      : failure(BeneficiaireIntrouvable())
  }

export const enregistrerUnAtelierCollectif =
  ({
    activiteDuMediateur,
    nouvelIdentifiant,
    nombreDeSuivisDuMediateur,
    lieuUtilisable,
    tagsUtilisables,
    rendezVousDUnAutreMediateur,
    rendezVousDejaSaisi,
    employeuseDeLaDate,
    creer,
    modifier,
    marquerLeRendezVousHonore,
  }: EnregistrerUnAtelierCollectifPorts) =>
  async ({
    saisie,
    mediateurId,
    maintenant,
  }: {
    readonly saisie: SaisieCollective
    readonly mediateurId: MediateurId | null
    readonly maintenant: Date
  }): Promise<
    Result<AtelierCollectifEnregistre, EchecDEnregistrerUnAtelierCollectif>
  > => {
    if (mediateurId === null) return failure(ActionNonAutorisee())

    const enregistrement = await enregistrementDeMediation({
      activiteDuMediateur,
      nouvelIdentifiant,
    })({ id: saisie.id, type: TypeDActivite('Collectif'), mediateurId })
    if (!enregistrement.success) return enregistrement

    const suivis = await suivisVerifies(nombreDeSuivisDuMediateur)(
      saisie.suivis,
      mediateurId,
    )
    if (!suivis.success) return suivis

    const lieu = await lieuVerifie({ lieuUtilisable })({
      lieu: saisie.lieu,
      enregistrement: enregistrement.data,
    })
    if (!lieu.success) return lieu

    const tags = tagsDeLaSaisie(saisie.tags, await tagsUtilisables(saisie.tags))
    if (!tags.success) return tags

    const rendezVous = await rendezVousVerifie({
      rendezVousDUnAutreMediateur,
      rendezVousDejaSaisi,
    })({
      rdvId: saisie.rdvId,
      activiteId: enregistrement.data.id,
      mediateurId,
    })
    if (!rendezVous.success) return rendezVous

    const { creation, identifiantV1 } = creationOuModification(
      enregistrement.data,
      maintenant,
    )
    const atelier = atelierDeLaSaisie({
      saisie,
      id: enregistrement.data.id,
      mediateurId,
      employeuse: await employeuseDeLaDate(saisie.date),
      origine: origineDeLaSaisie({ rdvId: saisie.rdvId, identifiantV1 }),
      creation,
      maintenant,
    })
    if (!atelier.success) return atelier

    const ecriture = ecritureDe(atelier.data, enregistrement.data)
    await ecrireLActiviteDeMediation({ creer, modifier })(ecriture)

    return success({
      ecriture,
      rendezVousHonore: await rendezVousHonore({ marquerLeRendezVousHonore })(
        saisie.rdvId,
      ),
    })
  }
