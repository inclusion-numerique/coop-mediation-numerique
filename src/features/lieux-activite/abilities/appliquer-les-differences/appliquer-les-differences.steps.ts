import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { appliquerLesDifferences } from '@/features/lieux-activite/abilities/appliquer-les-differences/domain/appliquer-les-differences'
import { consulterLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/implementations/prisma/consulter-la-fiche-du-lieu.query'
import type { ChoixDesDifferences } from '@/features/lieux-activite/domain/differences'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { enregistrerLesSections } from '@/features/lieux-activite/implementations/prisma/enregistrer-les-sections.mutation'
import { ficheSemee } from '@/features/lieux-activite/lieux-activite.cucumber'
import type { DifferencesAppliquees } from './domain/differences-appliquees'
import type { EchecDAppliquerLesDifferences } from './domain/errors'

const NOM_DE_LA_COOP = 'Maison France Services de Reims'
const NOM_DU_REGISTRE = 'Espace France Services de Reims'

const issue: {
  derniere?: Awaited<ReturnType<ReturnType<typeof appliquerLesDifferences>>>
} = {}

const inscrireTelleQuelle = async () => {
  const fiche = await consulterLaFicheDuLieu(LieuId(ficheSemee().lieuId))
  assert.ok(fiche, 'La fiche devrait être lisible')

  await enregistrerLesSections({
    lieu: fiche.lieu,
    sections: [
      'InformationsGenerales',
      'InformationsPratiques',
      'Description',
      'ServicesEtAccompagnement',
      'ModalitesAccesAuService',
      'TypesDePublicsAccueillis',
    ],
    maintenant: new Date(),
  })
}

const trancher = async (choix: ChoixDesDifferences) => {
  issue.derniere = await appliquerLesDifferences({
    consulter: consulterLaFicheDuLieu,
    enregistrer: enregistrerLesSections,
  })({
    id: LieuId(ficheSemee().lieuId),
    choix,
    par: UtilisateurId(ficheSemee().userIds[0] ?? ''),
    maintenant: new Date(),
  })
}

const derniereDecision = (): DifferencesAppliquees => {
  assert.ok(issue.derniere?.success, 'Les différences devraient s’appliquer')
  return issue.derniere.data
}

const dernierEchec = (): EchecDAppliquerLesDifferences => {
  assert.ok(
    issue.derniere && !issue.derniere.success,
    'Les différences ne devraient pas s’appliquer',
  )
  return issue.derniere.error
}

Given('cette fiche est inscrite telle quelle au registre', async () => {
  await inscrireTelleQuelle()
})

Given('une autre source a renommé ce lieu au registre', async () => {
  await inscrireTelleQuelle()
  await prismaClient.lieuInclusionRegistreMain.update({
    where: { structureCoopId: ficheSemee().lieuId },
    data: { nom: NOM_DU_REGISTRE },
  })
})

When('le médiateur rattaché reprend le nom saisi dans la coop', async () => {
  await trancher({ nom: 'coop' })
})

When('le médiateur rattaché garde le nom proposé par le registre', async () => {
  await trancher({ nom: 'registre' })
})

When(
  'le médiateur rattaché valide les différences sans rien choisir',
  async () => {
    await trancher({})
  },
)

Then('le registre porte le nom saisi dans la coop', async () => {
  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { structureCoopId: ficheSemee().lieuId },
      select: { nom: true },
    })

  assert.strictEqual(inscription.nom, NOM_DE_LA_COOP)
})

Then('la coop porte le nom proposé par le registre', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: ficheSemee().lieuId },
    select: { nom: true },
  })

  assert.strictEqual(lieu.nom, NOM_DU_REGISTRE)
})

Then("rien n'est réécrit", () => {
  assert.strictEqual(derniereDecision()._tag, 'SansEcart')
})

Then("les différences ne s'appliquent pas, faute de fiche", () => {
  assert.strictEqual(dernierEchec()._tag, 'FicheIntrouvable')
})
