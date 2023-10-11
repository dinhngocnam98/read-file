import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ReadFileService {
  constructor(private prisma: PrismaService) {}
  async upload(files: Array<Express.Multer.File>) {
    files.forEach((file) => {
      const contents = file.buffer.toString('utf-8').split('\n');
      contents.map(async (content, index) => {
        const name = contents[0].replace('\r', '');
        if (index > 2 && content !== '') {
          const record = content.replace('\r', '').split('\t');
          await this.prisma.records.create({
            data: {
              name: name,
              fileName: file.originalname,
              action: record[0] ? record[0] : null,
              sampleId: record[1] ? record[1] : null,
              trueValue: record[2] ? parseFloat(record[2]) : null,
              Conc: record[3] ? parseFloat(record[3]) : null,
              Abs: record[4] ? parseFloat(record[4]) : null,
              SG: record[5] ? parseFloat(record[5]) : null,
              date:
                record[6] && record[7]
                  ? new Date(record[6] + ' ' + record[7])
                  : null,
            },
          });
        }
      });
    });
    return {
      data: {
        message: 'Record saved to database',
      },
      status: 201,
      success: true,
    };
  }

  async getRecords() {
    const records = await this.prisma.records.findMany();

    return {
      data: records,
      status: 200,
      success: true,
    };
  }
}
