import type { ConversationModel } from 'src/chat21-core/models/conversation'

export const ALL_CONVERSATIONS_FILTER = 'all'

const UNKNOWN_SOURCE = 'unknown'

export interface ConversationSourceFilter {
  key: string
  label: string
  channelLabel: string
  instanceLabel?: string
  channel: string
  icon: string
  count: number
}

interface ConversationSource {
  key: string
  label: string
  channelLabel: string
  instanceLabel?: string
  channel: string
  icon: string
}

export interface ConversationSourceInstanceLabels {
  [integrationId: string]: string
}

const CHANNEL_ICONS = {
  chat21: 'assets/images/channel_icons/chat21.svg',
  email: 'assets/images/channel_icons/email-logo.svg',
  form: 'assets/images/channel_icons/form-logo_v2.svg',
  group: 'assets/images/channel_icons/group.svg',
  messenger: 'assets/images/channel_icons/messenger-logo.svg',
  telegram: 'assets/images/channel_icons/telegram-logo.svg',
  voice: 'assets/images/channel_icons/voice.svg',
  whatsapp: 'assets/images/channel_icons/whatsapp-logo.svg',
}

function normalizedValue(value: unknown): string {
  if (value === undefined || value === null) {
    return ''
  }
  return String(value).trim()
}

function sourceKey(channel: string, instanceId: string): string {
  return instanceId ? `${channel}:${instanceId}` : channel
}

function labelWithInstance(label: string, instanceLabel: string): string {
  return instanceLabel ? `${label} · ${instanceLabel}` : label
}

function getConversationSource(
  conversation: ConversationModel,
  integrationLabels: ConversationSourceInstanceLabels = {},
): ConversationSource {
  const attributes = conversation && conversation.attributes ? conversation.attributes : {}
  const attributeChannel = typeof attributes.channel === 'object'
    ? attributes.channel && attributes.channel.name
    : attributes.channel
  const rawChannel = normalizedValue(
    attributes.request_channel || attributeChannel || conversation.channel_type,
  ).toLowerCase()
  const integrationId = normalizedValue(attributes.integrationId || attributes.integration_id)
  const instanceLabel = normalizedValue(
    attributes.instanceLabel || attributes.integrationLabel || attributes.integration_name,
  )
  const sender = normalizedValue(conversation.sender)
  const senderIntegrationMatch = sender.match(/^casezap-([0-9a-f]{24})(?:-|$)/i)
  const senderIntegrationId = senderIntegrationMatch ? senderIntegrationMatch[1] : ''

  const isCaseZap = rawChannel === 'casezap' || Boolean(attributes.casezapPhone) || Boolean(senderIntegrationId)
  if (isCaseZap) {
    const caseZapPhone = normalizedValue(attributes.casezapPhone)
    const instanceId = integrationId || senderIntegrationId || instanceLabel || caseZapPhone
    const displayLabel = instanceLabel || integrationLabels[instanceId] || caseZapPhone ||
      (instanceId ? 'Instância sem nome' : '')
    return {
      key: sourceKey('casezap', instanceId),
      label: labelWithInstance('CaseZap', displayLabel),
      channelLabel: 'CaseZap',
      instanceLabel: displayLabel,
      channel: 'casezap',
      icon: CHANNEL_ICONS.whatsapp,
    }
  }

  const isWhatsApp = rawChannel === 'whatsapp' || rawChannel === 'waba' ||
    Boolean(attributes.waba_id || attributes.whatsapp_phone_number_id)
  if (isWhatsApp) {
    const instanceId = integrationId || normalizedValue(
      attributes.whatsapp_phone_number_id || attributes.waba_id,
    )
    const whatsappLabel = instanceLabel || normalizedValue(
      attributes.display_phone_number || attributes.phone_number,
    )
    return {
      key: sourceKey('whatsapp', instanceId),
      label: labelWithInstance('WhatsApp Business', whatsappLabel),
      channelLabel: 'WhatsApp Business',
      instanceLabel: whatsappLabel,
      channel: 'whatsapp',
      icon: CHANNEL_ICONS.whatsapp,
    }
  }

  if (rawChannel === 'telegram') {
    return {
      key: sourceKey('telegram', integrationId || instanceLabel),
      label: labelWithInstance('Telegram', instanceLabel),
      channelLabel: 'Telegram',
      instanceLabel,
      channel: 'telegram',
      icon: CHANNEL_ICONS.telegram,
    }
  }

  const knownChannels: { [channel: string]: { label: string, icon: string } } = {
    chat21: { label: 'Chat do site', icon: CHANNEL_ICONS.chat21 },
    email: { label: 'E-mail', icon: CHANNEL_ICONS.email },
    form: { label: 'Formulário', icon: CHANNEL_ICONS.form },
    messenger: { label: 'Messenger', icon: CHANNEL_ICONS.messenger },
    voice: { label: 'Voz', icon: CHANNEL_ICONS.voice },
  }
  const knownChannel = knownChannels[rawChannel]
  if (knownChannel) {
    return {
      key: rawChannel,
      label: knownChannel.label,
      channelLabel: knownChannel.label,
      channel: rawChannel,
      icon: knownChannel.icon,
    }
  }

  return {
    key: UNKNOWN_SOURCE,
    label: 'Outras conversas',
    channelLabel: 'Outras conversas',
    channel: UNKNOWN_SOURCE,
    icon: CHANNEL_ICONS.group,
  }
}

export function buildConversationSourceFilters(
  conversations: Array<ConversationModel>,
  integrationLabels: ConversationSourceInstanceLabels = {},
): Array<ConversationSourceFilter> {
  const sourceCounts: { [key: string]: ConversationSourceFilter } = {}

  for (const conversation of conversations || []) {
    const source = getConversationSource(conversation, integrationLabels)
    if (!sourceCounts[source.key]) {
      sourceCounts[source.key] = { ...source, count: 0 }
    }
    sourceCounts[source.key].count += 1
  }

  const filters = Object.keys(sourceCounts)
    .map(key => sourceCounts[key])
    .sort((left, right) => left.label.localeCompare(right.label))

  return [
    {
      key: ALL_CONVERSATIONS_FILTER,
      label: 'Todos',
      channelLabel: 'Todos',
      channel: ALL_CONVERSATIONS_FILTER,
      icon: CHANNEL_ICONS.group,
      count: (conversations || []).length,
    },
    ...filters,
  ]
}

export function filterConversationsBySource(
  conversations: Array<ConversationModel>,
  selectedSource: string,
): Array<ConversationModel> {
  if (!selectedSource || selectedSource === ALL_CONVERSATIONS_FILTER) {
    return conversations || []
  }

  return (conversations || []).filter(
    conversation => getConversationSource(conversation).key === selectedSource,
  )
}
