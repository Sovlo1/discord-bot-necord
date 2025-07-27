import { Injectable, UseGuards } from '@nestjs/common';
import { User } from 'discord.js';
import {
  Context,
  Options,
  SlashCommand,
  SlashCommandContext,
  TargetUser,
} from 'necord';
import { BarreStatusTargetDto } from 'src/Dtos/barre.status.target.dto';
import { BarreTargetDto } from 'src/Dtos/barre.user.target.dto';
import { GameDto } from 'src/Dtos/game.dto';
import { ReminderDto } from 'src/Dtos/remindme.dto';
import { ResponseService } from 'src/service/response.service';

@Injectable()
export class SlashCommandService {
  constructor(private readonly responseService: ResponseService) {}
  @SlashCommand({
    name: 'ping',
    description: 'Responds with pong!',
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply({ content: 'Pong!' });
  }

  @SlashCommand({
    name: 'barre',
    description: "Mettre une barre à quelqu'un",
  })
  public async barre(
    @Context() [interaction]: SlashCommandContext,
    @Options() { user, quantity }: BarreTargetDto,
  ) {
    return this.responseService.barreResponse([interaction], user, quantity);
  }

  @SlashCommand({
    name: 'barrestatus',
    description: 'voir combien de barres possède un utilisateur',
  })
  public async barreStatus(
    @Context() [interaction]: SlashCommandContext,
    @Options() { user }: BarreStatusTargetDto,
  ) {
    return this.responseService.barreStatusResponse([interaction], user);
  }

  @SlashCommand({
    name: 'crotte',
    description: 'Ajouter un caca au compteur de crottes',
  })
  public async crotte(@Context() [interaction]: SlashCommandContext) {
    return this.responseService.crotte([interaction]);
  }

  @SlashCommand({
    name: 'leaderbarre',
    description: 'voir les barres de tout le monde',
  })
  public async leaderBarre(@Context() [interaction]: SlashCommandContext) {
    return this.responseService.leaderBarre([interaction]);
  }

  @SlashCommand({
    name: 'leadercrotte',
    description: 'voir les crottes de tout le monde',
  })
  public async leaderCrotte(@Context() [interaction]: SlashCommandContext) {
    return this.responseService.leaderCrotte([interaction]);
  }

  @SlashCommand({
    name: 'remindme',
    description: 'set a reminder',
  })
  public async remindMe(
    @Context() [interaction]: SlashCommandContext,
    @Options() { about, when }: ReminderDto,
  ) {
    return this.responseService.remindMe([interaction], about, when);
  }

  @SlashCommand({
    name: 'pipi',
    description: 'pipi?',
  })
  public async pipi(@Context() [interaction]: SlashCommandContext) {
    return this.responseService.pipi([interaction]);
  }
}
