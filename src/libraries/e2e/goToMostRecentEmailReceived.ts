const maildevUrl = 'http://127.0.0.1:1080'

type EmailMaildev = {
  id: string
  time: string
  subject: string
}

const plusRecent = (emails: EmailMaildev[]): EmailMaildev | undefined =>
  emails.toSorted((premier, second) =>
    second.time.localeCompare(premier.time),
  )[0]

export const goToMostRecentEmailReceived = ({
  subjectInclude,
}: {
  subjectInclude: string
}) => {
  cy.log('Go check emails in maildev server')
  cy.request<EmailMaildev[]>(`${maildevUrl}/api/email`).then(({ body }) => {
    const email = plusRecent(body)
    expect(email?.subject).to.contain(subjectInclude)
    cy.visit(`${maildevUrl}/api/email/${email?.id}/html`)
  })
}
