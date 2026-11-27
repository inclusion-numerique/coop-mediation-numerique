import { type MediateurId, memeNom, type NomDuTag } from '../../../domain'
import type { TagDetenu, TagDuCoordinateur, TagsDetenus } from './ports'
import type { CopieDeTag, RepriseDeTag } from './retrait-des-tags'

type Destination = {
  readonly tag: TagDuCoordinateur
  readonly mediateurId: MediateurId
}

type Essaimage = {
  readonly detenus: readonly TagsDetenus[]
  readonly copies: readonly CopieDeTag[]
  readonly reprises: readonly RepriseDeTag[]
}

export const destinatairesDe = (
  tags: readonly TagDuCoordinateur[],
): readonly MediateurId[] => [
  ...new Set(tags.flatMap(({ utilisateurs }) => utilisateurs)),
]

const destinationsDe = (
  tags: readonly TagDuCoordinateur[],
): readonly Destination[] =>
  tags.flatMap((tag) =>
    [...new Set(tag.utilisateurs)].map((mediateurId) => ({ tag, mediateurId })),
  )

const deMemeNom =
  (mediateurId: MediateurId, nom: NomDuTag) =>
  (candidat: {
    readonly mediateurId: MediateurId
    readonly nom: NomDuTag
  }): boolean =>
    candidat.mediateurId === mediateurId && memeNom(candidat.nom, nom)

const tagDetenu = (
  detenus: readonly TagsDetenus[],
  { tag, mediateurId }: Destination,
): TagDetenu | undefined =>
  detenus
    .flatMap((detenu) =>
      detenu.tags.map((tagDuMediateur) => ({
        ...tagDuMediateur,
        mediateurId: detenu.mediateurId,
      })),
    )
    .find(deMemeNom(mediateurId, tag.nom))

const nouvelleCopie = ({ tag, mediateurId }: Destination): CopieDeTag => ({
  mediateurId,
  nom: tag.nom,
  description: tag.description,
  departement: tag.departement,
  depuis: [tag.id],
})

const copier = (
  copies: readonly CopieDeTag[],
  destination: Destination,
): readonly CopieDeTag[] => {
  const { tag, mediateurId } = destination
  const recoit = deMemeNom(mediateurId, tag.nom)

  return copies.some(recoit)
    ? copies.map((copie) =>
        recoit(copie) ? { ...copie, depuis: [...copie.depuis, tag.id] } : copie,
      )
    : [...copies, nouvelleCopie(destination)]
}

const essaimer = (
  essaimage: Essaimage,
  destination: Destination,
): Essaimage => {
  const detenu = tagDetenu(essaimage.detenus, destination)

  return detenu === undefined
    ? { ...essaimage, copies: copier(essaimage.copies, destination) }
    : {
        ...essaimage,
        reprises: [
          ...essaimage.reprises,
          {
            depuis: destination.tag.id,
            mediateurId: destination.mediateurId,
            vers: detenu.id,
          },
        ],
      }
}

export const essaimageDes = ({
  tags,
  detenus,
  partant,
}: {
  readonly tags: readonly TagDuCoordinateur[]
  readonly detenus: readonly TagsDetenus[]
  readonly partant: MediateurId | null
}): Essaimage =>
  destinationsDe(tags).reduce(essaimer, {
    detenus: detenus.filter(({ mediateurId }) => mediateurId !== partant),
    copies: [],
    reprises: [],
  })
