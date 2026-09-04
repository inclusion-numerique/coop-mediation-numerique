import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { lieuFromDomain } from '../../../../db'
import type { Lieu } from '../../../../domain/lieu'
import type { LieuId } from '../../../../domain/lieu-id'
import type { UserId } from '../../../../domain/user-id'
import { type EchecDeModification, FicheIntrouvable } from '../../domain/errors'
import {
  appliquerModification,
  type ModificationLieu,
  type SectionDeLaFiche,
} from '../../domain/modification-lieu'
import { consulterLaFicheDuLieu } from './consulter-la-fiche-du-lieu.query'

type Colonnes = ReturnType<typeof lieuFromDomain>

/**
 * Chaque section n'écrit que ses propres colonnes.
 *
 * Le routeur tRPC réétalait la ligne entière relue avant l'écriture
 * (`data: { ...structure, ...champsDeLaSection }`) : deux sections enregistrées
 * à peu d'intervalle et la seconde réécrivait la première avec des valeurs
 * périmées. La table ci-dessous rend cette collision impossible.
 */
const colonnesParSection: Record<
  SectionDeLaFiche,
  (colonnes: Colonnes) => Partial<Colonnes>
> = {
  InformationsGenerales: (colonnes) => ({
    nom: colonnes.nom,
    adresse: colonnes.adresse,
    commune: colonnes.commune,
    codePostal: colonnes.codePostal,
    codeInsee: colonnes.codeInsee,
    complementAdresse: colonnes.complementAdresse,
    latitude: colonnes.latitude,
    longitude: colonnes.longitude,
    banId: colonnes.banId,
    itinerance: colonnes.itinerance,
    typologies: colonnes.typologies,
    siret: colonnes.siret,
    rna: colonnes.rna,
    nomUsage: colonnes.nomUsage,
  }),
  VisibiliteCartographie: (colonnes) => ({
    visiblePourCartographieNationale: colonnes.visiblePourCartographieNationale,
  }),
  InformationsPratiques: (colonnes) => ({
    siteWeb: colonnes.siteWeb,
    ficheAccesLibre: colonnes.ficheAccesLibre,
    priseRdv: colonnes.priseRdv,
    horaires: colonnes.horaires,
  }),
  Description: (colonnes) => ({
    presentationResume: colonnes.presentationResume,
    presentationDetail: colonnes.presentationDetail,
    formationsLabels: colonnes.formationsLabels,
  }),
  ServicesEtAccompagnement: (colonnes) => ({
    services: colonnes.services,
    modalitesAccompagnement: colonnes.modalitesAccompagnement,
  }),
  ModalitesAccesAuService: (colonnes) => ({
    telephone: colonnes.telephone,
    courriels: colonnes.courriels,
    modalitesAcces: colonnes.modalitesAcces,
    fraisACharge: colonnes.fraisACharge,
  }),
  TypesDePublicsAccueillis: (colonnes) => ({
    publicsSpecifiquementAdresses: colonnes.publicsSpecifiquementAdresses,
    priseEnChargeSpecifique: colonnes.priseEnChargeSpecifique,
  }),
}

const ecriture = (lieu: Lieu, section: SectionDeLaFiche) => {
  const colonnes = lieuFromDomain(lieu)

  return {
    ...colonnesParSection[section](colonnes),
    modification: colonnes.modification,
    derniereModificationParId: colonnes.derniereModificationParId,
    derniereModificationSource: colonnes.derniereModificationSource,
  }
}

export const modifierLaFicheDuLieu = async ({
  id,
  modification,
  par,
  maintenant = new Date(),
}: {
  id: LieuId
  modification: ModificationLieu
  par: UserId
  maintenant?: Date
}): Promise<Result<Lieu, EchecDeModification>> => {
  const fiche = await consulterLaFicheDuLieu(id)

  if (fiche == null) return failure(FicheIntrouvable(id))

  const modifie = appliquerModification(
    fiche.lieu,
    modification,
    par,
    maintenant,
  )

  await prismaClient.lieuInclusion.update({
    where: { id },
    data: ecriture(modifie, modification.section),
  })

  return success(modifie)
}
