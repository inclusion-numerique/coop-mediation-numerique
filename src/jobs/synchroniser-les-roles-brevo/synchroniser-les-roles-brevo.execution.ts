import { brevoActif } from '@/configuration/brevo'
import { errorReporter } from '@/configuration/telemetry/serveur'
import { synchroniserLesRolesBrevo } from '@/features/utilisateurs/abilities/synchroniser-les-roles-brevo/domain/synchroniser-les-roles-brevo'
import {
  importerUnLot,
  retirerUnLot,
  TAILLE_DES_IMPORTS_BREVO,
  TAILLE_DES_RETRAITS_BREVO,
} from '@/features/utilisateurs/abilities/synchroniser-les-roles-brevo/implementations/brevo/liste-de-diffusion.mutation'
import { inscritsDeLaListe } from '@/features/utilisateurs/abilities/synchroniser-les-roles-brevo/implementations/prisma/inscrits-de-la-liste.query'
import { output } from '@/libraries/console'

export const executeSynchroniserLesRolesBrevo = async () => {
  if (!brevoActif()) {
    output('Synchronisation Brevo ignorée hors du déploiement main')
    return { skipped: true }
  }

  const resultat = await synchroniserLesRolesBrevo({
    lireLesInscrits: inscritsDeLaListe,
    importerUnLot,
    retirerUnLot,
  })({
    tailleDesImports: TAILLE_DES_IMPORTS_BREVO,
    tailleDesRetraits: TAILLE_DES_RETRAITS_BREVO,
  })
  if (!resultat.success) return resultat.error

  const bilan = {
    inscrits: resultat.data.inscrits,
    importes: resultat.data.importes.flatMap(({ contacts }) => contacts).length,
    retires: resultat.data.retires.flat().length,
    illisibles: resultat.data.illisibles,
    imports: resultat.data.importes.map(({ identifiant }) => identifiant),
    echecs: resultat.data.echecs,
  }

  output(
    `Rôles Brevo : ${bilan.inscrits} inscrits, ${bilan.importes} importés, ${bilan.retires} retirés, ${bilan.illisibles.length} illisibles, ${bilan.echecs.length} lots en échec`,
  )

  if (bilan.echecs.length > 0)
    errorReporter.captureMessage({
      message: `Synchronisation Brevo : ${bilan.echecs.length} lots en échec`,
      level: 'error',
    })

  return bilan
}
