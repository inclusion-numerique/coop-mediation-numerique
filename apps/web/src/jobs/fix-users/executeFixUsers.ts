import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { fixTelephone } from '@app/web/utils/clean-operations'
import { FixUsersJob } from './fixUsersJob'

export const executeFixUsers = async (_job: FixUsersJob) => {
  const users = await prismaClient.user.findMany()

  const usersWithPhone = users.filter(({ phone }) => phone != null)

  output.log(`Found ${usersWithPhone.length} users with phone number`)

  await Promise.all(
    usersWithPhone.map(({ id, phone }) =>
      prismaClient.user.update({
        where: { id },
        data: { phone: fixTelephone(phone) },
      }),
    ),
  )

  return {
    success: true,
  }
}
