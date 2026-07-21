import { ConversationListPage } from './conversations-list.page'

describe('ConversationListPage route selection', () => {
  it('marks an active conversation as selected before the list is loaded', () => {
    const page: any = Object.create(ConversationListPage.prototype)
    page.logger = { log: () => undefined }
    page.conversations = []
    page.archivedConversations = []
    page.unassignedConversations = []
    page.conversationsHandlerService = { uidConvSelected: null }
    page.archivedConversationsHandlerService = { uidConvSelected: null }

    page.setUidConvSelected('conversation-1', 'active')

    expect(page.conversationsHandlerService.uidConvSelected).toBe('conversation-1')
  })
})
