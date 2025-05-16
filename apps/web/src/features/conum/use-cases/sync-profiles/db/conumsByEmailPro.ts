import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'

export const conumsByEmailPro = async () => {
  const conseillerCollection =
    await conseillerNumeriqueMongoCollection('conseillers')
  const conseillersMongo = await conseillerCollection.find().toArray()

  return new Map(
    conseillersMongo.map((conseiller) => [conseiller.emailPro, conseiller]),
  )
}
