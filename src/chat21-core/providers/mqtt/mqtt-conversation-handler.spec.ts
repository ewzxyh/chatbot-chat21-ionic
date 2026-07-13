import { MessageModel } from '../../models/message';
import { UserModel } from '../../models/user';
import { Chat21Service } from './chat-service';
import { MQTTConversationHandler } from './mqtt-conversation-handler';

interface ServerMessage extends MessageModel {
    message_id: string;
}

describe('MQTTConversationHandler', () => {
    it('keeps one message when history and realtime use different temporary identities', () => {
        const historyMessage: ServerMessage = {
            uid: '',
            message_id: 'message-1',
            language: 'pt',
            recipient: 'conversation-1',
            recipient_fullname: 'Cliente',
            sender: 'customer-1',
            sender_fullname: 'Cliente',
            status: 200,
            metadata: null,
            text: 'Ola',
            timestamp: 1,
            type: 'text',
            attributes: { tempUID: 'temporary-1' },
            channel_type: 'group',
            isSender: false,
        };
        const realtimeMessage: ServerMessage = {
            ...historyMessage,
            attributes: { ...historyMessage.attributes },
        };
        let realtimeCallback: (realtimeMessage: ServerMessage, topic: string) => void = () => undefined;
        const chatService = new Chat21Service();
        chatService.chatClient = {
            lastMessages: (
                _conversationId: string,
                callback: (error: unknown, messages: ServerMessage[]) => void
            ) => callback(null, [historyMessage]),
            onMessageAddedInConversation: (
                _conversationId: string,
                callback: (realtimeMessage: ServerMessage, topic: string) => void
            ) => {
                realtimeCallback = callback;
            },
            onMessageUpdatedInConversation: () => undefined,
        };
        const handler = new MQTTConversationHandler(chatService, false);
        handler.initialize('conversation-1', 'Cliente', new UserModel('agent-1'), 'tenant', new Map());

        handler.connect();
        realtimeCallback(realtimeMessage, 'topic');

        expect(handler.messages.map(item => item.uid)).toEqual(['message-1']);
    });
});
