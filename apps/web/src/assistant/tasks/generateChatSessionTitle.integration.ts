import { generateChatSessionTitle } from '@app/web/assistant/tasks/generateChatSessionTitle'

describe('generateChatSessionTitle', () => {
  it('should generate a title', async () => {
    const title = await generateChatSessionTitle({
      messages: [
        {
          role: 'User',
          parts: [
            {
              type: 'text',
              text: 'Comment s’appellent les bébés des biches ?',
            },
          ],
        },
        {
          role: 'Assistant',
          parts: [
            {
              type: 'text',
              text: 'Les bébés des biches sont des faons.',
            },
          ],
        },
      ],
    })
    expect(title).toBeOneOf([
      'Faon de biche',
      'Faons de biche',
      'Bébés des biches',
      'Bébés de biches',
      'Nom des bébés biches',
    ])
  })
})
