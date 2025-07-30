import { prismaClient } from '@app/web/prismaClient'

export const deleteTag = async (tagId: string) => {
  await prismaClient.activitesTags.deleteMany({ where: { tagId } })
  await prismaClient.tag.delete({ where: { id: tagId } })
}
