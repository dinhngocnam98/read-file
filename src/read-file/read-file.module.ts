import { Module } from '@nestjs/common';
import { ReadFileService } from './read-file.service';
import { ReadFileController } from './read-file.controller';

@Module({
  controllers: [ReadFileController],
  providers: [ReadFileService]
})
export class ReadFileModule {}
