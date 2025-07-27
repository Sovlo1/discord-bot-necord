import { Role } from 'discord.js';
import { RoleOption } from 'necord';

export class GameDto {
  @RoleOption({
    name: 'jeu',
    description: 'à quoi jouer',
    required: true,
  })
  game: Role;
}
