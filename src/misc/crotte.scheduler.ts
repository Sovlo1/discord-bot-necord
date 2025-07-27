import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { DiscordUser } from 'src/schemas/discordUser.schema';

@Injectable()
export class CrotteCleanUpScheduler {
  constructor(
    @InjectModel(DiscordUser.name)
    private discordModel: Model<DiscordUser>,
  ) {}

  @Cron(CronExpression.EVERY_YEAR)
  async handleCron() {
    const discordUser = await this.discordModel.find();

    for (let i = 0; i < discordUser.length; i++) {
      await this.discordModel.updateOne(
        { _id: discordUser[i]._id },
        {
          crottes: 0,
        },
      );
    }
  }
}
