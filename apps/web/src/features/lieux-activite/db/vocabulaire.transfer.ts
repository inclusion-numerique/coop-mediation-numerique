import {
  DispositifProgrammeNational,
  FormationLabel,
  Frais,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
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

/**
 * Le vocabulaire du lieu appartient au schéma national ; la coop le stocke dans
 * ses propres enums Prisma. Les deux nomment presque toujours la même valeur de
 * la même façon — `ACI`, `GratuitSousCondition`, `Seniors` — et c'est ce nom de
 * membre qui sert de pont.
 *
 * Attention : ce sont bien les NOMS qui coïncident, pas les valeurs. Le standard
 * porte le libellé français en valeur (`"Aide aux démarches administratives"`)
 * là où Prisma porte le nom du membre (`"AideAuxDemarchesAdministratives"`).
 * Traduire en validant la valeur d'en face échouerait silencieusement — c'est ce
 * que le test de round-trip a rattrapé.
 *
 * Seules les quatre divergences réelles de nom sont énumérées. Écrire les dix
 * tables in extenso serait plus explicite mais plus fragile : chaque valeur
 * ajoutée en amont demanderait deux lignes, et une seule oubliée passerait
 * inaperçue jusqu'à la production.
 */
type Enumeration<Valeur extends string> = Partial<Record<string, Valeur>>

const nomParValeur = <Valeur extends string>(
  enumeration: Enumeration<Valeur>,
): Map<Valeur, string> =>
  new Map(
    Object.entries(enumeration).flatMap(([nom, valeur]) =>
      valeur == null ? [] : [[valeur, nom] as const],
    ),
  )

const exceptions = <Cle extends string, Valeur extends string>(
  paires: readonly (readonly [Cle, Valeur])[],
): Partial<Record<Cle, Valeur>> =>
  paires.reduce<Partial<Record<Cle, Valeur>>>(
    (table, [cle, valeur]) => ({ ...table, [cle]: valeur }),
    {},
  )

const traduire = <Prisma extends string, Standard extends string>(
  standard: Enumeration<Standard>,
  prisma: Enumeration<Prisma>,
  divergences: readonly (readonly [Prisma, Standard])[],
) => {
  const versStandardExceptionnel = exceptions(divergences)
  const versPrismaExceptionnel = exceptions(
    divergences.map(([depuis, vers]) => [vers, depuis] as const),
  )
  const nomStandard = nomParValeur(standard)

  return {
    versStandard: (valeur: Prisma): Standard | null =>
      versStandardExceptionnel[valeur] ?? standard[valeur] ?? null,
    versPrisma: (valeur: Standard): Prisma | null => {
      const exceptionnel = versPrismaExceptionnel[valeur]
      if (exceptionnel != null) return exceptionnel

      const nom = nomStandard.get(valeur)

      return nom == null ? null : (prisma[nom] ?? null)
    },
  }
}

export const service = traduire(Service, PrismaService, [
  [
    PrismaService.AcquisitionDeMaterielInformatiqueAPrixSolidaire,
    Service.MaterielInformatiqueAPrixSolidaire,
  ],
])

export const modaliteAcces = traduire(ModaliteAcces, PrismaModaliteAcces, [
  [PrismaModaliteAcces.FicheDePrescription, ModaliteAcces.PrescriptionParMail],
])

export const modaliteAccompagnement = traduire(
  ModaliteAccompagnement,
  PrismaModaliteAccompagnement,
  [
    [
      PrismaModaliteAccompagnement.DansUnAtelierCollectif,
      ModaliteAccompagnement.DansUnAtelier,
    ],
  ],
)

export const dispositifProgrammeNational = traduire(
  DispositifProgrammeNational,
  PrismaDispositifProgrammeNational,
  [
    [
      PrismaDispositifProgrammeNational.CertificationPix,
      DispositifProgrammeNational.CertificationPIX,
    ],
    [
      PrismaDispositifProgrammeNational.PointAccesNumeriqueCaf,
      DispositifProgrammeNational.PointNumeriqueCAF,
    ],
  ],
)

export const typologie = traduire(Typologie, PrismaTypologie, [
  [PrismaTypologie.Autre, Typologie.AUTRE],
])

export const fraisACharge = traduire(Frais, PrismaFraisACharge, [])

export const publicSpecifiquementAdresse = traduire(
  PublicSpecifiquementAdresse,
  PrismaPublicSpecifiquementAdresse,
  [],
)

export const priseEnChargeSpecifique = traduire(
  PriseEnChargeSpecifique,
  PrismaPriseEnChargeSpecifique,
  [],
)

export const formationLabel = traduire(FormationLabel, PrismaFormationLabel, [])

export const itinerance = traduire(Itinerance, PrismaItinerance, [])

/**
 * Une valeur que le pont ne sait pas traduire est écartée plutôt que portée
 * telle quelle : le domaine ne doit contenir que du vocabulaire du standard.
 */
export const traduites = <Depuis, Vers>(
  valeurs: readonly Depuis[],
  traduction: (valeur: Depuis) => Vers | null,
): readonly Vers[] =>
  valeurs
    .map(traduction)
    .filter((valeur): valeur is NonNullable<Vers> => valeur != null)
