import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { QUEUES, NOTIFICATION_JOBS } from './queue.constants'
import { TermiiService } from '../../common/notifications/termii.service'

@Processor(QUEUES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name)

  constructor(private readonly termii: TermiiService) {
    super()
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case NOTIFICATION_JOBS.PUSH:
        await this.handlePush(job.data)
        break
      case NOTIFICATION_JOBS.WHATSAPP:
        await this.handleWhatsApp(job.data)
        break
      case NOTIFICATION_JOBS.EMAIL:
        this.logger.log({ to: job.data.to }, 'email_notification_queued')
        break
      default:
        this.logger.warn({ jobName: job.name }, 'unknown_notification_job')
    }
  }

  private async handlePush(data: { userId: string; title: string; body: string; phone?: string }) {
    // If phone is available, fall back to SMS when FCM is not configured
    if (data.phone) {
      await this.termii.sendSMS(data.phone, `${data.title}\n\n${data.body}`)
    } else {
      this.logger.log({ userId: data.userId, title: data.title }, 'push_notification_logged_no_phone')
    }
  }

  private async handleWhatsApp(data: { phone: string; message: string; useSMS?: boolean }) {
    if (data.useSMS) {
      await this.termii.sendSMS(data.phone, data.message)
    } else {
      // Try WhatsApp first, fall back to SMS
      const result = await this.termii.sendWhatsApp(data.phone, data.message)
      if (!result.sent) {
        this.logger.log({ phone: data.phone.slice(0, 6) + '****' }, 'whatsapp_failed_falling_back_to_sms')
        await this.termii.sendSMS(data.phone, data.message)
      }
    }
  }
}
