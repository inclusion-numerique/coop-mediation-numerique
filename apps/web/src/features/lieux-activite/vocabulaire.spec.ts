import {
  DispositifProgrammeNational as PrismaDispositifProgrammeNational,
  FormationLabel as PrismaFormationLabel,
  FraisACharge as PrismaFraisACharge,
  Itinerance as PrismaItinerance,
  ModaliteAcces as PrismaModaliteAcces,
  ModaliteAccompagnement as PrismaModaliteAccompagnement,
  PriseEnChargeSpecifique as PrismaPriseEnChargeSpecifique,
  PublicSpecifiquementAdresse as PrismaPublicSpecifiquementAdresse,
  Service as PrismaService,
  Typologie as PrismaTypologie,
} from '@prisma/client'
import * as vocabulaire from './vocabulaire'

type Pont<Prisma extends string, Standard extends string> = {
  versStandard: (valeur: Prisma) => Standard | null
  versCoop: (valeur: Standard) => Prisma | null
}

/**
 * Le pont traduit par nom de membre et écarte en silence ce qu'il ne sait pas
 * traduire : sans ce test, une divergence de nommage introduite en amont — par
 * une montée du paquet standard — ferait disparaître des valeurs en production
 * sans qu'aucun test ne tombe. On exerce donc l'intégralité de chaque enum.
 */
const exerceTouteLEnumeration = <
  Prisma extends string,
  Standard extends string,
>(
  enumeration: Record<string, Prisma>,
  pont: Pont<Prisma, Standard>,
) => {
  const valeurs = Object.values(enumeration)

  it('traduit toutes les valeurs Prisma vers le standard', () => {
    expect(
      valeurs.filter((valeur) => pont.versStandard(valeur) == null),
    ).toEqual([])
  })

  it('revient à la valeur Prisma de départ', () => {
    const allerRetour = valeurs.map((valeur) => {
      const standard = pont.versStandard(valeur)

      return standard == null ? null : pont.versCoop(standard)
    })

    expect(allerRetour).toEqual(valeurs)
  })
}

describe('pont de vocabulaire', () => {
  describe('service', () =>
    exerceTouteLEnumeration(PrismaService, vocabulaire.service))

  describe('typologie', () =>
    exerceTouteLEnumeration(PrismaTypologie, vocabulaire.typologie))

  describe('frais à charge', () =>
    exerceTouteLEnumeration(PrismaFraisACharge, vocabulaire.fraisACharge))

  describe('itinérance', () =>
    exerceTouteLEnumeration(PrismaItinerance, vocabulaire.itinerance))

  describe('modalité d’accès', () =>
    exerceTouteLEnumeration(PrismaModaliteAcces, vocabulaire.modaliteAcces))

  describe('modalité d’accompagnement', () =>
    exerceTouteLEnumeration(
      PrismaModaliteAccompagnement,
      vocabulaire.modaliteAccompagnement,
    ))

  describe('public spécifiquement adressé', () =>
    exerceTouteLEnumeration(
      PrismaPublicSpecifiquementAdresse,
      vocabulaire.publicSpecifiquementAdresse,
    ))

  describe('prise en charge spécifique', () =>
    exerceTouteLEnumeration(
      PrismaPriseEnChargeSpecifique,
      vocabulaire.priseEnChargeSpecifique,
    ))

  describe('formation et label', () =>
    exerceTouteLEnumeration(PrismaFormationLabel, vocabulaire.formationLabel))

  describe('dispositif ou programme national', () =>
    exerceTouteLEnumeration(
      PrismaDispositifProgrammeNational,
      vocabulaire.dispositifProgrammeNational,
    ))
})
