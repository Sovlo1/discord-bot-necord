import { User } from 'discord.js';
import { StringOption, UserOption } from 'necord';

export class BarreTargetDto {
  @UserOption({
    name: 'qui',
    description: 'celui qui recevra des barres',
    required: true,
  })
  user: User;
  @StringOption({
    name: 'combien',
    description: 'a',
    required: true,
  })
  quantity: string;
}
