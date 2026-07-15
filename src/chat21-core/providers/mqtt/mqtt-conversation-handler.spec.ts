import { MessageModel } from '../../models/message';
import { UserModel } from '../../models/user';
import { Chat21Service } from './chat-service';
import { MQTTConversationHandler } from './mqtt-conversation-handler';

interface ServerMessage extends MessageModel {
    message_id: string;
}

const disableLogger = (handler: MQTTConversationHandler) => {
    Object.defineProperty(handler, 'logger', {
        value: {
            error: () => undefined,
            log: () => undefined,
        },
    });
};

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
        disableLogger(handler);
        handler.initialize('conversation-1', 'Cliente', new UserModel('agent-1'), 'tenant', new Map());

        handler.connect();
        realtimeCallback(realtimeMessage, 'topic');

        expect(handler.messages.map(item => item.uid)).toEqual(['message-1']);
    });

    it('keeps one message when alternate Chat21 ids share a Tiledesk message id', () => {
        const realtimeMessage: ServerMessage = {
            uid: '',
            message_id: 'realtime-alias',
            language: 'pt',
            recipient: 'conversation-1',
            recipient_fullname: 'Cliente',
            sender: 'customer-1',
            sender_fullname: 'Cliente',
            status: 200,
            metadata: null,
            text: 'Boa noite...',
            timestamp: 1,
            type: 'text',
            attributes: { tiledesk_message_id: '6a55631f93747700136301b9' },
            channel_type: 'group',
            isSender: false,
        };
        const historyMessage: ServerMessage = {
            ...realtimeMessage,
            uid: '',
            message_id: '748f5504-7d2f-4899-8a20-c460d967c98c',
            attributes: { ...realtimeMessage.attributes },
        };
        let historyCallback: (error: unknown, messages: ServerMessage[]) => void = () => undefined;
        let realtimeCallback: (message: ServerMessage, topic: string) => void = () => undefined;
        const chatService = new Chat21Service();
        chatService.chatClient = {
            lastMessages: (
                _conversationId: string,
                callback: (error: unknown, messages: ServerMessage[]) => void
            ) => {
                historyCallback = callback;
            },
            onMessageAddedInConversation: (
                _conversationId: string,
                callback: (message: ServerMessage, topic: string) => void
            ) => {
                realtimeCallback = callback;
            },
            onMessageUpdatedInConversation: () => undefined,
        };
        const handler = new MQTTConversationHandler(chatService, false);
        disableLogger(handler);
        handler.initialize('conversation-1', 'Cliente', new UserModel('agent-1'), 'tenant', new Map());

        handler.connect();
        realtimeCallback(realtimeMessage, 'topic');
        historyCallback(null, [historyMessage]);

        expect(handler.messages.map(item => item.uid)).toEqual([
            '748f5504-7d2f-4899-8a20-c460d967c98c',
        ]);
    });
});
