import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { AssignmentsController } from './assignments.controller'
import { AssignmentsService } from './assignments.service'
import { QUEUES } from '../queues/queue.constants'

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUES.NOTIFICATIONS },
      { name: QUEUES.TRUST_SCORE },
    ),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
