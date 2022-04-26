import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  messages: Message[] = [{ name: `Leo`, text: 'Hello World' }];
  clientToUser = {};

  joinRoom(name: string, clientId: string) {
    this.clientToUser[clientId] = name;
    return Object(this.clientToUser);
  }

  getClientByName(name: string) {
    return this.clientToUser[name];
  }

  create(createMessageDto: CreateMessageDto, clientId: string) {
    const message = {
      name: this.clientToUser[clientId],
      text: createMessageDto.text,
    };
    this.messages.push(message);

    return message;
  }

  findAll() {
    return this.messages;
  }
  findAllParticipants() {
    return this.clientToUser;
  }
}
