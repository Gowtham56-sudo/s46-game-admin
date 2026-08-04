import { Response } from 'express';

let clients: Response[] = [];

export function addClient(res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  
  // Send an initial heartbeat
  res.write(': heartbeat\n\n');
  
  clients.push(res);
  
  res.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
}

export function broadcastState(state: any) {
  const data = `data: ${JSON.stringify(state)}\n\n`;
  clients.forEach(client => {
    client.write(data);
  });
}

export function broadcastParticipants(participants: any) {
  const data = `event: participants\ndata: ${JSON.stringify(participants)}\n\n`;
  clients.forEach(client => {
    client.write(data);
  });
}
