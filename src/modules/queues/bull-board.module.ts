import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

export function getBullBoardModule() {
  const bullBoardModule = BullBoardModule.forRoot({
    route: '/ctrls',
    adapter: ExpressAdapter,
  });

  return bullBoardModule;
}
