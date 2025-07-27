import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class GameMeetUp {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  messageId: string;

  @Prop()
  botMessageId: string;

  @Prop()
  createdAt: Date;
}

export const GameMeetUpSchema = SchemaFactory.createForClass(GameMeetUp);
