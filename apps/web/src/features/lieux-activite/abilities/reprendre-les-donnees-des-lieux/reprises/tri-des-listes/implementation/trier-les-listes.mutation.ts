import {
  inscriptionPourLIdentifiantCarto,
  lieuCoopToDomain,
  lieuFromDomain,
  lieuVersRegistre,
} from '@app/web/features/lieux-activite/implementation'
import { prismaClient } from '@app/web/prismaClient'
import type { ColonneDeListe } from '../domain/listes-a-trier'
import type { TrierLesListes } from '../domain/tri-des-listes'

const retenirSi =
  (aEcrire: readonly ColonneDeListe[]) =>
  <T>(colonne: ColonneDeListe, valeur: T): T | undefined =>
    aEcrire.includes(colonne) ? valeur : undefined

const listesDeLaCoop = (
  coop: ReturnType<typeof lieuFromDomain>,
  aEcrire: readonly ColonneDeListe[],
) => {
  const retenue = retenirSi(aEcrire)

  return {
    typologies: retenue('typologies', coop.typologies),
    services: retenue('services', coop.services),
    modalitesAcces: retenue('modalitesAcces', coop.modalitesAcces),
    modalitesAccompagnement: retenue(
      'modalitesAccompagnement',
      coop.modalitesAccompagnement,
    ),
    publicsSpecifiquementAdresses: retenue(
      'publicsSpecifiquementAdresses',
      coop.publicsSpecifiquementAdresses,
    ),
    priseEnChargeSpecifique: retenue(
      'priseEnChargeSpecifique',
      coop.priseEnChargeSpecifique,
    ),
    fraisACharge: retenue('fraisACharge', coop.fraisACharge),
    itinerance: retenue('itinerance', coop.itinerance),
    dispositifProgrammesNationaux: retenue(
      'dispositifProgrammesNationaux',
      coop.dispositifProgrammesNationaux,
    ),
    formationsLabels: retenue('formationsLabels', coop.formationsLabels),
    autresFormationsLabels: retenue(
      'autresFormationsLabels',
      coop.autresFormationsLabels,
    ),
  }
}

const listesDuRegistre = (
  registre: ReturnType<typeof lieuVersRegistre>,
  aEcrire: readonly ColonneDeListe[],
) => {
  const retenue = retenirSi(aEcrire)

  return {
    typologies: retenue('typologies', registre.typologies),
    services: retenue('services', registre.services),
    modalitesAcces: retenue('modalitesAcces', registre.modalitesAcces),
    modalitesAccompagnement: retenue(
      'modalitesAccompagnement',
      registre.modalitesAccompagnement,
    ),
    publicsSpecifiquementAdresses: retenue(
      'publicsSpecifiquementAdresses',
      registre.publicsSpecifiquementAdresses,
    ),
    priseEnChargeSpecifique: retenue(
      'priseEnChargeSpecifique',
      registre.priseEnChargeSpecifique,
    ),
    fraisACharge: retenue('fraisACharge', registre.fraisACharge),
    itinerance: retenue('itinerance', registre.itinerance),
    formationsLabels: retenue('formationsLabels', registre.formationsLabels),
  }
}

export const trierLesListes: TrierLesListes = async (lieuId, colonnes) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
  })

  if (ligne == null) return

  const lieu = lieuCoopToDomain(ligne)

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: {
        ...listesDeLaCoop(lieuFromDomain(lieu), colonnes),
        modification: ligne.modification,
      },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: listesDuRegistre(lieuVersRegistre(lieu), colonnes),
    })
  })
}
