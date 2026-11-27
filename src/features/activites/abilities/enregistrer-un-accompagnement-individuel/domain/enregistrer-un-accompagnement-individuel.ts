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
import type { EchecDEnregistrerUnAccompagnementIndividuel } from './errors'
import type {
  BeneficiaireDuMediateur,
  EnregistrerUnAccompagnementIndividuelPorts,
} from './ports'
import {
  type AccompagnementIndividuelEnregistre,
  accompagnementDeLaSaisie,
  type BeneficiaireSaisi,
  beneficiaireAccompagneDe,
  type SaisieIndividuelle,
} from './saisie-individuelle'

const suiviDe =
  (beneficiaireDuMediateur: BeneficiaireDuMediateur) =>
  async (
    beneficiaire: BeneficiaireSaisi,
    mediateurId: MediateurId,
  ): Promise<Result<BeneficiaireId | null, BeneficiaireIntrouvable>> => {
    if (beneficiaire.id === null) return success(null)
    const trouve = await beneficiaireDuMediateur({
      id: beneficiaire.id,
      mediateurId,
    })
    if (trouve === null) return failure(BeneficiaireIntrouvable())
    return success(trouve.anonyme ? null : beneficiaire.id)
  }

export const enregistrerUnAccompagnementIndividuel =
  ({
    activiteDuMediateur,
    nouvelIdentifiant,
    beneficiaireDuMediateur,
    lieuUtilisable,
    tagsUtilisables,
    rendezVousDUnAutreMediateur,
    rendezVousDejaSaisi,
    employeuseDeLaDate,
    creer,
    modifier,
    marquerLeRendezVousHonore,
  }: EnregistrerUnAccompagnementIndividuelPorts) =>
  async ({
    saisie,
    mediateurId,
    maintenant,
  }: {
    readonly saisie: SaisieIndividuelle
    readonly mediateurId: MediateurId | null
    readonly maintenant: Date
  }): Promise<
    Result<
      AccompagnementIndividuelEnregistre,
      EchecDEnregistrerUnAccompagnementIndividuel
    >
  > => {
    if (mediateurId === null) return failure(ActionNonAutorisee())

    const enregistrement = await enregistrementDeMediation({
      activiteDuMediateur,
      nouvelIdentifiant,
    })({ id: saisie.id, type: TypeDActivite('Individuel'), mediateurId })
    if (!enregistrement.success) return enregistrement

    const suivi = await suiviDe(beneficiaireDuMediateur)(
      saisie.beneficiaire,
      mediateurId,
    )
    if (!suivi.success) return suivi

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
    const accompagnement = accompagnementDeLaSaisie({
      saisie,
      id: enregistrement.data.id,
      mediateurId,
      beneficiaire: beneficiaireAccompagneDe(saisie.beneficiaire, suivi.data),
      employeuse: await employeuseDeLaDate(saisie.date),
      origine: origineDeLaSaisie({ rdvId: saisie.rdvId, identifiantV1 }),
      creation,
      maintenant,
    })
    if (!accompagnement.success) return accompagnement

    const ecriture = ecritureDe(accompagnement.data, enregistrement.data)
    await ecrireLActiviteDeMediation({ creer, modifier })(ecriture)

    return success({
      ecriture,
      rendezVousHonore: await rendezVousHonore({ marquerLeRendezVousHonore })(
        saisie.rdvId,
      ),
    })
  }
