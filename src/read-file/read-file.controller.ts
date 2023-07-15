import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { ReadFileService } from './read-file.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('records')
@ApiTags('Record')
export class ReadFileController {
  constructor(private readonly readFileService: ReadFileService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  upload(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.readFileService.upload(files);
  }
  @Get()
  getRecords() {
    return this.readFileService.getRecords();
  }
}
