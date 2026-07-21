import { ConversationListPage } from './conversations-list.page'
import { AppComponent } from '../../app.component'

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

describe('AppComponent notification routing', () => {
  it('recognizes the conversation currently open by route', () => {
    const app: any = Object.create(AppComponent.prototype)
    app.audio = { pause: () => undefined, currentTime: 1 }
    app.audio_NewConv = { pause: () => undefined, currentTime: 1 }
    app.audio_Unassigned = { pause: () => undefined, currentTime: 1 }

    app.subscribeConversationRouteSelected('conversation-1')

    expect(app.isActiveConversation({ conversation_with: 'conversation-1' })).toBe(true)
    expect(app.isActiveConversation({ conversation_with: 'conversation-2' })).toBe(false)
  })
})
