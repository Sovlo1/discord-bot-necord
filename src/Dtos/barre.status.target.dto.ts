import { User } from 'discord.js';
import { UserOption } from 'necord';

export class BarreStatusTargetDto {
  @UserOption({
    name: 'qui',
    description: 'celui qui recevra des barres',
    required: true,
  })
  user: User;
}
