import { ConversationModel } from 'src/chat21-core/models/conversation'
import {
  ALL_CONVERSATIONS_FILTER,
  buildConversationSourceFilters,
  filterConversationsBySource,
} from './conversation-source-filter'

function conversation(uid: string, attributes: any): ConversationModel {
  return { uid, attributes } as ConversationModel
}

describe('conversation source filter', () => {
  it('separates CaseZap instances and filters without changing the source list', () => {
    const conversations = [
      conversation('one', {
        request_channel: 'casezap',
        integrationId: 'integration-one',
        instanceLabel: 'Loja Centro',
      }),
      conversation('two', {
        request_channel: 'casezap',
        integrationId: 'integration-two',
        instanceLabel: 'Loja Norte',
      }),
    ]

    const filters = buildConversationSourceFilters(conversations)
    const filtered = filterConversationsBySource(conversations, 'casezap:integration-two')

    expect(filters.map(filter => filter.label)).toEqual([
      'Todos',
      'CaseZap · Loja Centro',
      'CaseZap · Loja Norte',
    ])
    expect(filtered.map(item => item.uid)).toEqual(['two'])
    expect(conversations.length).toBe(2)
  })

  it('keeps legacy conversations visible in Todos and groups them as Outras conversas', () => {
    const conversations = [conversation('legacy', {})]
    const filters = buildConversationSourceFilters(conversations)

    expect(filters[0].key).toBe(ALL_CONVERSATIONS_FILTER)
    expect(filters[0].count).toBe(1)
    expect(filters[1].label).toBe('Outras conversas')
    expect(filterConversationsBySource(conversations, 'unknown')).toEqual(conversations)
  })

  it('uses the WhatsApp phone number id to distinguish WABA instances', () => {
    const conversations = [
      conversation('waba', {
        request_channel: 'whatsapp',
        whatsapp_phone_number_id: 'phone-number-one',
      }),
    ]

    const filters = buildConversationSourceFilters(conversations)

    expect(filters[1].key).toBe('whatsapp:phone-number-one')
    expect(filters[1].label).toBe('WhatsApp Business')
  })

  it('uses only a CaseZap integration id from the sender fallback', () => {
    const conversations = [
      { uid: 'outgoing', attributes: { request_channel: 'casezap' }, sender: 'casezap-6a546a62937477001361fc0c-fromme' } as ConversationModel,
      { uid: 'incoming', attributes: { request_channel: 'casezap' }, sender: 'casezap-556292131417' } as ConversationModel,
    ]

    const filters = buildConversationSourceFilters(conversations)

    expect(filters[1].key).toBe('casezap')
    expect(filters[1].count).toBe(1)
    expect(filters[2].key).toBe('casezap:6a546a62937477001361fc0c')
    expect(filters[2].label).toBe('CaseZap · Instância 61fc0c')
  })
})
