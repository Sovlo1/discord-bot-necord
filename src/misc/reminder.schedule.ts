import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Reminder } from 'src/schemas/reminder.schema';
import { ResponseService } from 'src/service/response.service';

@Injectable()
export class ReminderScheduler {
  constructor(
    @InjectModel(Reminder.name)
    private reminderModel: Model<Reminder>,
    private logger: Logger,
    private responseService: ResponseService,
  ) {}

  @Cron('*/5 * * * * *')
  async handleCron() {
    this.logger.log({
      message: 'Getting remaining reminders',
      context: ReminderScheduler.name,
    });
    const reminders = await this.reminderModel.find({
      whenToRemind: {
        $lt: new Date(),
      },
    });

    for (let i = 0; i < reminders.length; i++) {
      await this.responseService.sendReminders(reminders[i]).then(async () => {
        return await this.reminderModel.deleteOne({ _id: reminders[i]._id });
      });
    }
  }
}
