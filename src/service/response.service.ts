import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  GuildMember,
  MessageFlags,
  Role,
  User,
} from 'discord.js';
import { Model, Types } from 'mongoose';
import { SlashCommandContext } from 'necord';
import { DiscordUser } from 'src/schemas/discordUser.schema';
import * as chrono from 'chrono-node';
import { Reminder } from 'src/schemas/reminder.schema';

@Injectable()
export class ResponseService {
  constructor(
    @InjectModel(DiscordUser.name)
    private discordModel: Model<DiscordUser>,
    @InjectModel(Reminder.name)
    private reminderModel: Model<Reminder>,
    private logger: Logger,
    private client: Client,
  ) {}

  async barreResponse(
    [interaction]: SlashCommandContext,
    user: User,
    quantity: string,
  ) {
    this.logger.log({
      message: `User [${interaction.user.displayName}] is attempting to add [${quantity}] bar(s) to [${user.displayName}]`,
      context: ResponseService.name,
    });

    if (interaction.user.id !== process.env.BAR_MASTER) {
      this.logger.log({
        message: `User [${interaction.user.displayName}] is not allowed to add bars to other users`,
        context: ResponseService.name,
      });
      return interaction.reply({
        content: "Vous n'avez pas le droit de mettre des barres",
        flags: MessageFlags.Ephemeral,
      });
    }

    let parsedQuantity = parseInt(quantity);

    if (Number.isNaN(parsedQuantity)) {
      this.logger.error({
        message: `Quantité de barre non valide, utilisez des chiffres ou nombres`,
        context: ResponseService.name,
      });
      return interaction.reply({
        content:
          'Quantité de barre non valide, utilisez des chiffres ou nombres',
        flags: MessageFlags.Ephemeral,
      });
    }

    let targetUser: DiscordUser | null;
    let operation: string;

    switch (true) {
      case parsedQuantity === -1:
        operation = 'enlevée';
        parsedQuantity = Math.abs(parsedQuantity);
        break;
      case parsedQuantity < -1:
        operation = 'enlevées';
        parsedQuantity = Math.abs(parsedQuantity);
        break;
      case parsedQuantity === 1:
        operation = 'ajoutée';
        break;
      case parsedQuantity > 1:
        operation = 'ajoutées';
        break;
      default:
        operation = "Ajouter ou supprimer 0 barre n'a eu aucun effet.";
    }

    targetUser = await this.discordModel.findOne({ userId: user.id });

    const replyMessage: string =
      parsedQuantity === 0
        ? operation
        : `${parsedQuantity} barre${parsedQuantity > 1 ? 's' : ''} ${parsedQuantity > 1 ? 'ont' : 'a'} été ${operation} à l'utilisateur ${user.displayName}`;

    if (targetUser === null) {
      await new this.discordModel({
        _id: new Types.ObjectId(),
        userId: user.id,
        username: user.displayName,
        barres: 0 + parsedQuantity,
      }).save();

      return interaction.reply(replyMessage);
    }

    await this.discordModel.updateOne(
      { userId: user.id },
      {
        barres: targetUser.barres + parsedQuantity,
        username: user.displayName,
      },
    );

    return interaction.reply(replyMessage);
  }

  async barreStatusResponse([interaction]: SlashCommandContext, user: User) {
    const discordUser: DiscordUser | null = await this.discordModel.findOne({
      userId: user.id,
    });

    if (discordUser === null) {
      return interaction.reply("Cet utilisateur n'a pas encore de barres");
    }

    return interaction.reply(
      `${discordUser.username} a ${discordUser.barres} barre${discordUser.barres > 1 || discordUser.barres < -1 ? 's' : ''}.`,
    );
  }

  async crotte([interaction]: SlashCommandContext) {
    let discordUser: DiscordUser | null;

    discordUser = await this.discordModel.findOne({
      userId: interaction.user.id,
    });

    if (discordUser === null) {
      await new this.discordModel({
        _id: new Types.ObjectId(),
        userId: interaction.user.id,
        username: interaction.user.displayName,
        crottes: 1,
        barres: 0,
      }).save();

      return interaction.reply(
        `${interaction.user.username} vient de crotter ce qui porte son total de crottes de l'année à 1`,
      );
    }

    if (discordUser.crottes) {
      await this.discordModel.updateOne(
        { userId: interaction.user.id },
        { crottes: discordUser.crottes + 1 },
      );

      return interaction.reply(
        `${interaction.user.username} vient de crotter ce qui porte son total de crottes de l'année à ${discordUser.crottes + 1}`,
      );
    }

    if (!discordUser.crottes) {
      await this.discordModel.updateOne(
        { userId: interaction.user.id },
        { crottes: 1 },
      );

      return interaction.reply(
        `${interaction.user.username} vient de crotter ce qui porte son total de crottes de l'année à 1`,
      );
    }
  }

  async leaderBarre([interaction]: SlashCommandContext) {
    const discordUsers = await this.discordModel
      .find()
      .sort({ barres: 'desc' });

    const mappedUsers = discordUsers.map((x, i) => {
      if (x.barres === undefined) {
        return;
      }
      let pluralCheck: string = 'barre';
      if (x.barres > 1 || x.barres < -1) {
        pluralCheck = 'barres';
      }
      return `${i + 1}: ${x.username} avec ${x.barres !== undefined ? x.barres : '0'} ${pluralCheck} \n`;
    });

    return interaction.reply(mappedUsers.join(''));
  }

  async leaderCrotte([interaction]: SlashCommandContext) {
    const discordUsers = await this.discordModel
      .find()
      .sort({ crottes: 'desc' });

    const mappedUsers = discordUsers.map((x, i) => {
      if (x.crottes === undefined) {
        return;
      }
      let pluralCheck: string = 'crotte';
      if (x.crottes > 1 || x.crottes < -1) {
        pluralCheck = 'crottes';
      }
      return `${i + 1}: ${x.username} avec ${x.crottes !== undefined ? x.crottes : '0'} ${pluralCheck} \n`;
    });

    return interaction.reply(mappedUsers.join(''));
  }

  async remindMe(
    [interaction]: SlashCommandContext,
    about: string,
    when: string,
  ) {
    let date = chrono.parseDate(when);

    if (date === null) {
      date = chrono.fr.parseDate(when);
    }

    if (date === null) {
      return interaction.reply({
        content: "La date n'est pas valide",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (this.checkIfDateIsValid(date)) {
      await new this.reminderModel({
        _id: new Types.ObjectId(),
        user_id: interaction.user.id,
        name: interaction.user.displayName,
        iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
        about: about,
        whenToRemind: new Date(date),
      }).save();

      return interaction.reply(
        `Ok ${interaction.user.displayName}, je te rappellerais à propos de ${about} ${when}`,
      );
    }

    return interaction.reply(
      "Impossible d'ajouter un mémo sur une date antérieure à aujourd'hui",
    );
  }

  async pipi([interaction]: SlashCommandContext) {
    return interaction.reply('PIPI XD');
  }

  checkIfDateIsValid(date: Date) {
    return date.getTime() > Date.now();
  }

  async sendReminders(reminder: Reminder) {
    const user = await this.client.users.fetch(reminder.user_id);

    const embedMessage = new EmbedBuilder()
      .setColor('Blurple')
      .setAuthor({
        name: reminder.name || 'N/A',
        iconURL: reminder.iconURL,
      })
      .setDescription(reminder.about)
      .addFields({
        name: 'Reminder',
        value: `Vous avez demandé un mémo à propos de ${reminder.about}`,
      });

    try {
      await user.send({ embeds: [embedMessage] });
    } catch (err) {
      return;
    }
  }
}
