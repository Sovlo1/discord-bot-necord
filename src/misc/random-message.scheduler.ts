import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { DiscordUser } from 'src/schemas/discordUser.schema';
import { HallOfFameMessage } from 'src/schemas/hallOfFame.schema';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';

@Injectable()
export class RandomMessageScheduler {
  constructor(
    @InjectModel(HallOfFameMessage.name)
    private readonly hallOfFameMessageModel: Model<HallOfFameMessage>,
    private readonly client: Client,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleCron() {
    const messageCount = await this.hallOfFameMessageModel.countDocuments();

    const randomIndex = Math.floor(Math.random() * messageCount);

    const randomMessage = await this.hallOfFameMessageModel
      .findOne()
      .skip(randomIndex);

    const baseChannel = (await this.client.channels.fetch(
      process.env.BASE_CHANNEL_ID as string,
    )) as TextChannel;

    if (randomMessage) {
      await baseChannel.send({
        content: `${randomMessage.createdAt.toLocaleString()}`,
        embeds: randomMessage.embeds.map((embed) => EmbedBuilder.from(embed)),
      });
    }
  }
}
