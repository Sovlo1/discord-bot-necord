import { StringOption } from 'necord';

export class ReminderDto {
  @StringOption({
    name: 'about',
    description: 'what to remind you of',
    required: true,
  })
  about: string;
  @StringOption({
    name: 'when',
    description: 'when to remind you of something',
    required: true,
  })
  when: string;
}
