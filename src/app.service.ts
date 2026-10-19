import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Context, On, Once, ContextOf } from 'necord';
import { Client, TextChannel } from 'discord.js';
import { MessageReactionService } from './service/message.reaction.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HallOfFameMessage } from './schemas/hallOfFame.schema';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  public constructor(
    private readonly client: Client,
    private readonly messageReactionService: MessageReactionService,
    @InjectModel(HallOfFameMessage.name)
    private readonly hallOfFameMessageModel: Model<HallOfFameMessage>,
  ) {}

  async hallOfFameMessageListingFunc() {
    const hallOfFameChannel = (await this.client.channels.fetch(
      process.env.HALL_OF_FAME_CHANNEL_ID as string,
    )) as TextChannel;

    this.logger.log(
      `Fetching channel ${hallOfFameChannel.name} (${hallOfFameChannel.id})`,
    );

    let before: string | undefined;
    let numberOfItems: number = 0;

    while (true) {
      const batch = await hallOfFameChannel.messages.fetch({
        limit: 100,
        ...(before ? { before } : {}),
      });

      if (batch.size === 0) break;

      for (const message of batch.values()) {
        numberOfItems++;
        const hallOfFameId = await this.hallOfFameMessageModel.findOne({
          messageId: message.id,
        });

        if (!hallOfFameId) {
          await new this.hallOfFameMessageModel({
            _id: new Types.ObjectId(),
            messageId: message.id,
            botMessageId: message.id,
            messageContent: message.content,
            embeds: message.embeds.map((embed) => embed.toJSON()),
            createdAt: message.createdAt,
          }).save();
        }
      }

      before = batch.last()!.id;

      if (batch.size < 100) {
        this.logger.log({
          message: `Finished fetching hall of fame messages, found ${numberOfItems} messages`,
          context: AppService.name,
        });
        break;
      }
    }
  }

  @Once('ready')
  public async onReady(@Context() [client]: ContextOf<'ready'>) {
    await this.hallOfFameMessageListingFunc();
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
