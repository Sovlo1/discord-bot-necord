import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class HallOfFameMessage {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  messageId: string;

  @Prop()
  botMessageId: string;

  @Prop()
  messageContent: string;

  @Prop()
  starQuantity: number;

  @Prop()
  createdAt: Date;
}

export const HallOfFameMessageSchema =
  SchemaFactory.createForClass(HallOfFameMessage);
