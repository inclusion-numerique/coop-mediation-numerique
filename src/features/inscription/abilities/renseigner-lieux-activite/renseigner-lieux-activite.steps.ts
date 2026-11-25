import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { renseignerLieuxActiviteAvec } from '@/features/inscription/abilities/renseigner-lieux-activite/implementations/renseigner-lieux-activite.binding'
import { ProfilInscription } from '@/features/inscription/domain'
import {
  seedLieuActivite,
  seedProfilChoisi,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'

const etat: {
  ancienneActivite?: { readonly id: string; readonly lieuId: string }
  lieuRenseigne?: string
  confies: string[]
} = { confies: [] }

const lireLesActivitesEnCours = async () =>
  etat.ancienneActivite === undefined
    ? []
    : [
        {
          id: etat.ancienneActivite.id,
          lieuInclusion: {
            id: etat.ancienneActivite.lieuId,
            structureCartographieNationaleId: null,
          },
        },
      ]

const confierAuRattachement = async (
  _transaction: unknown,
  { lieu }: { readonly lieu: { readonly id?: string | null } },
) => {
  if (lieu.id != null) etat.confies.push(lieu.id)
}

Given('je suis un médiateur en cours d’inscription', async () => {
  await seedProfilChoisi(ProfilInscription.schema.parse('Mediateur'))
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: utilisateurDeLInscriptionEnCours() },
  })
})

Given('j’exerce déjà dans un ancien lieu', async () => {
  const lieuId = await seedLieuActivite({ nom: 'Ancien lieu' })
  const { id } = await prismaClient.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId: utilisateurDeLInscriptionEnCours() } },
      lieuInclusion: { connect: { id: lieuId } },
      debut: new Date(),
    },
    select: { id: true },
  })
  etat.ancienneActivite = { id, lieuId }
})

When(
  'je renseigne un lieu connu de la coop comme lieu d’activité',
  async () => {
    etat.lieuRenseigne = v4()
    const resultat = await renseignerLieuxActiviteAvec({
      trouverStructuresCarto: async () => new Map(),
      lireLieuxActiviteExistants: lireLesActivitesEnCours,
      rattacherAuLieuDesire: confierAuRattachement,
    })({
      command: {
        userId: utilisateurDeLInscriptionEnCours(),
        lieuxActivite: [
          {
            id: etat.lieuRenseigne,
            structureCartographieNationaleId: null,
            nom: 'Lieu connu',
            adresse: '1 rue de la Paix',
            commune: 'Paris',
            codePostal: '75001',
          },
        ],
      },
      maintenant: new Date(),
    })
    assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
  },
)

Then('l’étape lieux d’activité est franchie', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurDeLInscriptionEnCours() },
    select: { lieuxActiviteRenseignes: true },
  })
  assert.ok(
    user.lieuxActiviteRenseignes,
    'L’étape lieux d’activité n’est pas marquée franchie',
  )
})

Then('ce lieu est confié au rattachement', () => {
  assert.deepStrictEqual(etat.confies, [etat.lieuRenseigne])
})

Then('mon ancien lieu d’activité est retiré', async () => {
  const activite = await prismaClient.mediateurEnActivite.findUniqueOrThrow({
    where: { id: etat.ancienneActivite?.id ?? '' },
    select: { fin: true, suppression: true },
  })
  assert.ok(
    activite.fin !== null && activite.suppression !== null,
    'L’ancien lieu d’activité n’a pas été retiré',
  )
})

After(() => {
  delete etat.ancienneActivite
  delete etat.lieuRenseigne
  etat.confies = []
})
