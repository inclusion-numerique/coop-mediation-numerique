import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma/prisma-client'

setDefaultTimeout(60_000)

const domaineDesComptesSemes = '@authentification.cucumber.example'

export const semerUnePersonneConnectee = async (
  appareils: number,
): Promise<readonly string[]> => {
  const jetons = Array.from({ length: appareils }, () => v4())
  await prismaClient.user.create({
    data: {
      email: `${v4()}${domaineDesComptesSemes}`,
      sessions: {
        create: jetons.map((sessionToken) => ({
          sessionToken,
          expires: new Date('2099-01-01'),
        })),
      },
    },
  })
  return jetons
}

export const sessionOuverte = async (sessionToken: string): Promise<boolean> =>
  (await prismaClient.session.count({ where: { sessionToken } })) === 1

After(async () => {
  await prismaClient.user.deleteMany({
    where: { email: { endsWith: domaineDesComptesSemes } },
  })
})
