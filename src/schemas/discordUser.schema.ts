import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class DiscordUser {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  userId: string;

  @Prop()
  username: string;

  @Prop()
  barres: number;

  @Prop()
  crottes: number;
}

export const DiscordUserSchema = SchemaFactory.createForClass(DiscordUser);
