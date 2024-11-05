import { ObjectId } from 'mongodb'
import { v4 } from 'uuid'
import {
  type Prisma,
  ProfilInscription,
  StructureCartographieNationale,
} from '@prisma/client'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import type { SessionUser } from '@app/web/auth/sessionUser'
import type { PremanenceConseillerNumerique } from '@app/web/external-apis/conseiller-numerique/PremanenceConseillerNumerique'
import { toStructureFromCartoStructure } from '@app/web/structure/toStructureFromCartoStructure'
import type {
  ConseillerNumeriqueByEmailFinder,
  ConseillerNumeriqueFound,
} from '@app/web/external-apis/conseiller-numerique/findConseillerNumeriqueByEmail'
import {
  associateConseillersCoordonnesTo,
  associateCoordinateursTo,
  associateLieuxAtiviteFor,
  createConseillerNumerique,
  createCoordinateur,
  createStructureEmployeuseFor,
  createStructures,
  findCartoStructureFor,
  findConseillerNumeriquesFor,
  findCoordinateursFor,
  findExistingStructureFor,
  findExistingStructuresCartoFor,
  markAsCheckedConseillerNumerique,
  markAsCheckedCoordinateur,
  markAsCheckedMediateur,
  removeConseillerNumeriqueFor,
  removeLieuxActiviteFor,
  removeMediateur,
  structureEmployeuseOf,
  toId,
} from './importFromConseillerNumerique.queries'

type ImportFromConseillerNumeriquePayload = {
  user: SessionUser
  profil: ProfilInscription
}

type StructureCartographieNationaleWithMatchingStructure =
  StructureCartographieNationale & {
    structures: { id: string }[] | null
  }

const isAlreadyConseillerOrCoordinateur = (user: SessionUser) =>
  user.checkConseillerNumeriqueInscription != null ||
  user.checkCoordinateurInscription != null

const isAlreadyConseillerOrNotCoordinateur = (user: SessionUser) =>
  user.checkConseillerNumeriqueInscription != null ||
  user.checkCoordinateurInscription == null

const isNotConseillerAndCoordinateur = (user: SessionUser) =>
  user.checkConseillerNumeriqueInscription == null ||
  user.checkCoordinateurInscription == null

const isConseillerNumerique = (
  mediateur?: SessionUser['mediateur'],
): mediateur is NonNullable<SessionUser['mediateur']> =>
  mediateur?.conseillerNumerique?.id != null

const toStructureToCreate = (permanence: PremanenceConseillerNumerique) =>
  ({
    id: v4(),
    nom: permanence.nomEnseigne,
    siteWeb: permanence.siteWeb,
    adresse: `${permanence.adresse.numeroRue} ${permanence.adresse.rue}`.trim(),
    commune: permanence.adresse.ville,
    codePostal: permanence.adresse.codePostal,
    latitude: permanence.location.coordinates[1],
    longitude: permanence.location.coordinates[0],
    siret: permanence.siret,
    codeInsee: permanence.adresse.codeCommune,
  }) satisfies Prisma.StructureCreateManyInput

const onlyWithoutStructure = (
  structureCarto: StructureCartographieNationaleWithMatchingStructure,
) => !structureCarto.structures

const withAPermanenceMatchingIdOf =
  ({ _id }: { _id: ObjectId }) =>
  (structure: StructureCartographieNationaleWithMatchingStructure) =>
    structure.conseillerNumeriquePermanenceIds.includes(_id.toString())

const toMatchingCartoStructureIn =
  (structures: StructureCartographieNationaleWithMatchingStructure[]) =>
  (permanence: { _id: ObjectId }) =>
    structures.find(withAPermanenceMatchingIdOf(permanence))

const onlyWithoutMatchingPermanenceIn =
  (structures: StructureCartographieNationaleWithMatchingStructure[]) =>
  (permanence: { _id: ObjectId }) =>
    !structures.some(withAPermanenceMatchingIdOf(permanence))

const createForProfilFor =
  (conseiller: ConseillerNumeriqueFound) =>
  async (user: SessionUser, profil: ProfilInscription) =>
    profil === ProfilInscription.ConseillerNumerique
      ? createConseillerNumerique(conseiller, user)
      : createCoordinateur(conseiller, user)

const importLieuxActivitesFromConseillerNumerique =
  (userWithProfile: { profileId: string }) =>
  async (conseillerFound: ConseillerNumeriqueFound) => {
    const existingCartoStructures: StructureCartographieNationaleWithMatchingStructure[] =
      await findExistingStructuresCartoFor(conseillerFound)

    const noExistingCartoNorStructureWithThePermanenceIds =
      conseillerFound.permanences
        .filter(onlyWithoutMatchingPermanenceIn(existingCartoStructures))
        .map(toStructureToCreate)

    const existingCartoButNoStructureWithThePermanenceIds =
      conseillerFound.permanences
        .map(toMatchingCartoStructureIn(existingCartoStructures))
        .filter(onlyDefinedAndNotNull)
        .filter(onlyWithoutStructure)
        .map(toStructureFromCartoStructure)

    const existingCartoAndStructureWithThePermanenceIds =
      conseillerFound.permanences
        .map(toMatchingCartoStructureIn(existingCartoStructures))
        .filter(onlyDefinedAndNotNull)
        .map(toId)

    const structuresToCreate = [
      ...noExistingCartoNorStructureWithThePermanenceIds,
      ...existingCartoButNoStructureWithThePermanenceIds,
    ]

    await createStructures(structuresToCreate)

    const lieuxActiviteStructureIds = [
      ...existingCartoAndStructureWithThePermanenceIds,
      ...noExistingCartoNorStructureWithThePermanenceIds.map(toId),
      ...existingCartoButNoStructureWithThePermanenceIds.map(toId),
    ]

    await associateLieuxAtiviteFor(userWithProfile)(lieuxActiviteStructureIds)

    return lieuxActiviteStructureIds
  }

const toSessionUser = (
  user: Omit<
    SessionUser,
    | 'usurper'
    | 'emailVerified'
    | 'created'
    | 'updated'
    | 'hasSeenOnboarding'
    | 'inscriptionValidee'
    | 'structureEmployeuseRenseignee'
    | 'checkConseillerNumeriqueInscription'
    | 'checkCoordinateurInscription'
    | 'lieuxActiviteRenseignes'
  > & {
    emailVerified: Date | null
    created: Date
    updated: Date
    hasSeenOnboarding: Date | null
    inscriptionValidee: Date | null
    structureEmployeuseRenseignee: Date | null
    checkConseillerNumeriqueInscription: Date | null
    checkCoordinateurInscription: Date | null
    lieuxActiviteRenseignes: Date | null
  },
): SessionUser => ({
  ...user,
  emailVerified: user.emailVerified?.toString() ?? null,
  created: user.created.toString(),
  updated: user.updated.toString(),
  hasSeenOnboarding: user.hasSeenOnboarding?.toString() ?? null,
  inscriptionValidee: user.inscriptionValidee?.toString() ?? null,
  structureEmployeuseRenseignee:
    user.structureEmployeuseRenseignee?.toString() ?? null,
  checkConseillerNumeriqueInscription:
    user.checkConseillerNumeriqueInscription?.toString() ?? null,
  checkCoordinateurInscription:
    user.checkCoordinateurInscription?.toString() ?? null,
  lieuxActiviteRenseignes: user.lieuxActiviteRenseignes?.toString() ?? null,
  usurper: null,
})

export const importFromConseillerNumerique =
  (findConseillerNumeriqueByEmail: ConseillerNumeriqueByEmailFinder) =>
  async ({
    user,
    profil,
  }: ImportFromConseillerNumeriquePayload): Promise<SessionUser> => {
    console.log(
      'IS ALREADY CONSEILLER OR COORDINATEUR',
      isAlreadyConseillerOrCoordinateur(user),
    )

    if (isAlreadyConseillerOrCoordinateur(user)) return user

    const conseillerFound = await findConseillerNumeriqueByEmail(user.email)

    console.log('CHECK USER', user)
    console.log('CONSEILLER FOUND', conseillerFound)

    if (conseillerFound == null) {
      return markAsCheckedMediateur(user).then(toSessionUser)
    }

    const userWithProfile = isConseillerNumerique(user.mediateur)
      ? { profileId: user.mediateur.id, id: user.id }
      : await createForProfilFor(conseillerFound)(user, profil)

    if (profil === ProfilInscription.ConseillerNumerique) {
      const coordinateurs = await findCoordinateursFor(conseillerFound)
      await associateCoordinateursTo(userWithProfile)(coordinateurs)
    } else {
      const conseillers = await findConseillerNumeriquesFor(conseillerFound)
      await associateConseillersCoordonnesTo(userWithProfile)(conseillers)
    }

    const existingStructure = await findExistingStructureFor(conseillerFound)

    const structureCartographieNationale =
      existingStructure?.structureCartographieNationaleId
        ? { id: existingStructure.structureCartographieNationaleId }
        : await findCartoStructureFor(conseillerFound)

    const structureEmployeuse =
      existingStructure ??
      (await createStructureEmployeuseFor(conseillerFound)(
        structureCartographieNationale,
      ))

    if (profil === ProfilInscription.Coordinateur) {
      return markAsCheckedCoordinateur(user, structureEmployeuse).then(
        toSessionUser,
      )
    }

    const lieuxActiviteStructureIds =
      await importLieuxActivitesFromConseillerNumerique(userWithProfile)(
        conseillerFound,
      )

    return markAsCheckedConseillerNumerique(
      user,
      structureEmployeuse,
      lieuxActiviteStructureIds,
    ).then(toSessionUser)
  }

export const assignConseillerNumeriqueRoleToCoordinateur =
  (findConseillerNumeriqueByEmail: ConseillerNumeriqueByEmailFinder) =>
  async (user: SessionUser): Promise<SessionUser> => {
    if (isAlreadyConseillerOrNotCoordinateur(user)) return user

    const conseillerFound = await findConseillerNumeriqueByEmail(user.email)

    if (conseillerFound == null)
      return markAsCheckedMediateur(user).then(toSessionUser)

    const employe = await structureEmployeuseOf(user)
    if (employe?.structure == null) return user

    const userWithProfile = isConseillerNumerique(user.mediateur)
      ? { profileId: user.mediateur.id, id: user.id }
      : await createForProfilFor(conseillerFound)(
          user,
          ProfilInscription.ConseillerNumerique,
        )

    const lieuxActiviteStructureIds =
      await importLieuxActivitesFromConseillerNumerique(userWithProfile)(
        conseillerFound,
      )

    return markAsCheckedConseillerNumerique(
      user,
      employe.structure,
      lieuxActiviteStructureIds,
    ).then(toSessionUser)
  }

export const removeConseillerNumeriqueRoleToCoordinateur = async (
  user: SessionUser,
): Promise<SessionUser> => {
  if (isNotConseillerAndCoordinateur(user)) return user

  await removeLieuxActiviteFor(user)
  await removeConseillerNumeriqueFor(user)

  return removeMediateur(user).then(toSessionUser)
}
