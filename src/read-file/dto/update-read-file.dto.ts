import { PartialType } from '@nestjs/swagger';
import { CreateReadFileDto } from './create-read-file.dto';

export class UpdateReadFileDto extends PartialType(CreateReadFileDto) {}
