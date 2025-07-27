import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Client,
  Collection,
  EmbedBuilder,
  MessageReaction,
  Role,
  TextChannel,
  User,
} from 'discord.js';
import { Model, Types } from 'mongoose';
import { ContextOf } from 'necord';
import { GameMeetUp } from 'src/schemas/game-meetup.schema';
import { HallOfFameMessage } from 'src/schemas/hallOfFame.schema';

@Injectable()
export class MessageReactionService {
  constructor(
    @InjectModel(GameMeetUp.name)
    private readonly gameMeetUpModel: Model<GameMeetUp>,
    @InjectModel(HallOfFameMessage.name)
    private readonly hallOfFameMessageModel: Model<HallOfFameMessage>,
    private readonly client: Client,
  ) {}

  async addToHallOfFame(message: MessageReaction) {
    const hallOfFameChannel = (await this.client.channels.fetch(
      process.env.HALL_OF_FAME_CHANNEL_ID as string,
    )) as TextChannel;

    const isMsgAlreadyInHoF = await this.hallOfFameMessageModel.findOne({
      messageId: message.message.id,
    });

    let starValue: string;

    switch (true) {
      case message.countDetails.normal <= 4:
        starValue = '⭐ ';
        break;
      case message.countDetails.normal <= 7:
        starValue = '🌟 ';
        break;
      case message.countDetails.normal <= 9:
        starValue = '💫 ';
        break;
      case message.countDetails.normal > 9:
        starValue = '🔥 ';
        break;
      default:
        starValue = '⭐ ';
        break;
    }

    if (
      isMsgAlreadyInHoF === null &&
      message.emoji.name === '⭐' &&
      message.countDetails.normal >= 3
    ) {
      const embedMessage = new EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({
          name: message.message.author?.globalName || 'N/A',
          iconURL: message.message.author?.displayAvatarURL({
            extension: 'png',
          }),
        })
        .setDescription(message.message.content)
        .addFields({
          name: 'Source',
          value: `[Jump to message](${message.message.url})`,
        });

      const sentHoFMessage = hallOfFameChannel.send({
        content:
          starValue + '**' + message.countDetails.normal.toString() + '**',
        embeds: [embedMessage],
      });
      const msgId = (await sentHoFMessage).id;

      await new this.hallOfFameMessageModel({
        _id: new Types.ObjectId(),
        messageId: message.message.id,
        botMessageId: msgId,
        messageContent: message.message.content,
        starQuantity: message.countDetails.normal,
        createdAt: new Date(),
      }).save();

      return;
    }

    if (isMsgAlreadyInHoF !== null) {
      const msg = await hallOfFameChannel.messages.fetch(
        isMsgAlreadyInHoF.botMessageId,
      );

      await this.hallOfFameMessageModel.updateOne(
        { botMessageId: isMsgAlreadyInHoF.botMessageId },
        {
          starQuantity: message.countDetails.normal,
        },
      );

      await msg.edit({
        content:
          starValue + '**' + message.countDetails.normal.toString() + '**',
      });
    }
  }

  async addToGameMeetup(
    message: MessageReaction,
    role: Collection<string, Role>,
    userList: Collection<string, User>,
  ) {
    if (role.size === 0) {
      return;
    }

    if (message.countDetails.normal >= 3) {
      const msgSent = await this.gameMeetUpModel.findOne({
        messageId: message.message.id,
      });

      const channel = (await this.client.channels.fetch(
        message.message.channelId,
      )) as TextChannel;

      const userIdList = userList.map((user, userId) => {
        return `<@${userId}>`;
      });

      const roleList = role.map((role, roleId) => {
        return `<@&${roleId}>`;
      });

      if (!msgSent) {
        const botMsg = await channel.send({
          content: `Vous êtes ${message.countDetails.normal} pour faire un ${roleList[0]}, ${userIdList.join(' ')}`,
        });

        const botMessageId = botMsg.id;

        return await new this.gameMeetUpModel({
          _id: new Types.ObjectId(),
          messageId: message.message.id,
          botMessageId: botMessageId,
          createdAt: new Date(),
        }).save();
      }

      const msg = await channel.messages.fetch(msgSent.botMessageId);

      return await msg.edit({
        content: `Vous êtes ${message.countDetails.normal} pour faire un ${roleList[0]}, ${userIdList.join(' ')}`,
      });
    }
  }
}
