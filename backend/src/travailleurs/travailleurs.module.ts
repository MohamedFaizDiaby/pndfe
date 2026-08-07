import { Module } from '@nestjs/common';
import { TravailleursController } from './travailleurs.controller';
import { TravailleursService } from './travailleurs.service';

@Module({
  controllers: [TravailleursController],
  providers: [TravailleursService],
})
export class TravailleursModule {}
