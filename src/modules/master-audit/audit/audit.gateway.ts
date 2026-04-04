// src/modules/master-audit/audit/audit.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true }) // Frontend မှ လှမ်းချိတ်နိုင်ရန်
export class AuditGateway {
  @WebSocketServer()
  server!: Server;

  // အရေးပေါ် Alert လွှင့်ရန်
  sendSecurityAlert(message: string, data: unknown) {
    this.server.emit('securityAlert', { message, data, time: new Date() });
  }
}
