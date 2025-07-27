import { Injectable, Logger } from '@nestjs/common';
import { Context, On, Once, ContextOf } from 'necord';
import { Client } from 'discord.js';
import { MessageReactionService } from './service/message.reaction.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  public constructor(
    private readonly client: Client,
    private readonly messageReactionService: MessageReactionService,
  ) {}

  @Once('ready')
  public onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }

  @On('messageReactionAdd')
  public async onReactionAdd(
    @Context() [message]: ContextOf<'messageReactionAdd'>,
  ) {
    const fetchedMessage = await message.fetch();
    if (fetchedMessage.emoji.name === '⭐') {
      return await this.messageReactionService.addToHallOfFame(fetchedMessage);
    }

    // return await this.messageReactionService.
    const role = fetchedMessage.message.mentions.roles;

    if (role.size === 0) {
      return;
    }

    const userList = await message.users.fetch();

    return await this.messageReactionService.addToGameMeetup(
      fetchedMessage,
      role,
      userList,
    );
  }
}
