import { Component, Input, OnInit } from '@angular/core';
import {
  MSG_STATUS_FAILED,
  MSG_STATUS_RECEIVED,
  MSG_STATUS_RETURN_RECEIPT,
  MSG_STATUS_SEEN,
  MSG_STATUS_SENDING,
  MSG_STATUS_SENT,
  MSG_STATUS_SENT_SERVER
} from 'src/chat21-core/utils/constants';

@Component({
  selector: 'chat-return-receipt',
  templateUrl: './return-receipt.component.html',
  styleUrls: ['./return-receipt.component.scss']
})
export class ReturnReceiptComponent implements OnInit {

  @Input() status: number;
  @Input() message: any;

  // ========== begin:: set icon status message
  MSG_STATUS_FAILED = MSG_STATUS_FAILED;
  MSG_STATUS_SENDING = MSG_STATUS_SENDING;
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
  MSG_STATUS_RECEIVED = MSG_STATUS_RECEIVED;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  MSG_STATUS_SEEN = MSG_STATUS_SEEN;
  // ========== end:: icon status message

  constructor() { }

  ngOnInit() {
  }

  getStatusLabel(): string {
    if (this.status === MSG_STATUS_FAILED) {
      return 'Falha no envio';
    }
    if (!this.status || this.status === MSG_STATUS_SENDING) {
      return 'Enviando';
    }
    if (this.status === MSG_STATUS_SENT || this.status === MSG_STATUS_SENT_SERVER) {
      return 'Enviado';
    }
    if (this.status === MSG_STATUS_RECEIVED || this.status === MSG_STATUS_RETURN_RECEIPT) {
      return 'Entregue';
    }
    if (this.status === MSG_STATUS_SEEN) {
      return 'Lido';
    }
    return 'Status desconhecido';
  }

  getChannelLabel(): string {
    const attrs = this.message?.attributes || {};
    const metadata = this.message?.metadata || {};
    const rawChannel = attrs.request_channel ||
      attrs.channel_type ||
      attrs.channel ||
      metadata.request_channel ||
      metadata.channel_type ||
      this.message?.channel_type ||
      '';

    const normalized = String(rawChannel).toLowerCase();
    if (normalized.includes('whatsapp')) {
      return 'WhatsApp';
    }
    if (normalized.includes('telegram')) {
      return 'Telegram';
    }
    if (normalized.includes('email')) {
      return 'E-mail';
    }
    if (normalized.includes('messenger')) {
      return 'Messenger';
    }
    if (normalized.includes('chat21') || normalized.includes('web')) {
      return 'Chat';
    }
    return '';
  }

  getTooltipLabel(): string {
    const channel = this.getChannelLabel();
    return channel ? `${this.getStatusLabel()} via ${channel}` : this.getStatusLabel();
  }

  isDeliveredOrRead(): boolean {
    return this.status === MSG_STATUS_RECEIVED ||
      this.status === MSG_STATUS_RETURN_RECEIPT ||
      this.status === MSG_STATUS_SEEN;
  }

}
