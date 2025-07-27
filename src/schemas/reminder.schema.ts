import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EmbedBuilder } from 'discord.js';
import { Types } from 'mongoose';

@Schema()
export class Reminder {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  user_id: string;

  @Prop()
  name: string;

  @Prop()
  iconURL: string;

  @Prop()
  about: string;

  @Prop()
  whenToRemind: Date;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
