import { NecordModule } from 'necord';
import { Logger, Module } from '@nestjs/common';
import { IntentsBitField } from 'discord.js';
import { AppService } from './app.service';
import { SlashCommandService } from './commands/slashCommands.service';
import { ResponseService } from './service/response.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscordUser, DiscordUserSchema } from './schemas/discordUser.schema';
import { GameMeetUp, GameMeetUpSchema } from './schemas/game-meetup.schema';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { ScheduleModule } from '@nestjs/schedule';
import { MessageReactionService } from './service/message.reaction.service';
import { Reminder, ReminderSchema } from './schemas/reminder.schema';
import {
  HallOfFameMessage,
  HallOfFameMessageSchema,
} from './schemas/hallOfFame.schema';
import { ReminderScheduler } from './misc/reminder.schedule';

require('dotenv').config();

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.TOKEN as string,
      development: [process.env.DEVELOPMENT as string],
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
      ],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    MongooseModule.forFeature([
      { name: DiscordUser.name, schema: DiscordUserSchema },
      { name: GameMeetUp.name, schema: GameMeetUpSchema },
      { name: Reminder.name, schema: ReminderSchema },
      { name: HallOfFameMessage.name, schema: HallOfFameMessageSchema },
    ]),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('MyApp', {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
      ],
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    AppService,
    SlashCommandService,
    ResponseService,
    Logger,
    MessageReactionService,
    ReminderScheduler,
  ],
})
export class AppModule {}
