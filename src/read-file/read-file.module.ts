import { Module } from '@nestjs/common';
import { ReadFileService } from './read-file.service';
import { ReadFileController } from './read-file.controller';
import { join } from 'path';
import * as fs from 'fs-extra';
import * as chokidar from 'chokidar';
import * as process from 'process';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [ReadFileController],
  providers: [ReadFileService],
})
export class ReadFileModule {
  constructor(private prisma: PrismaService) {}
  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') {
      const folderPath = join(process.cwd(), './Read-here');

      // Đọc nội dung của các tệp tin .txt lần đầu tiên
      await this.readFileContents(folderPath);

      // Theo dõi sự thay đổi trong thư mục và cập nhật nội dung của các tệp tin .txt
      chokidar.watch(folderPath).on('all', async (event, path) => {
        if (
          event === 'add' &&
          path.endsWith('.txt') &&
          !path.includes('saved')
        ) {
          const contents = fs.readFileSync(path, 'utf-8');
          await this.saveDatabase(contents, path);
          const newPath = path.replace('.txt', '_saved.txt');
          fs.rename(path, newPath);
        }
      });
    }
  }

  //đọc nội dung file txt
  private async readFileContents(folderPath: string) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      if (file.endsWith('.txt') && !file.includes('saved')) {
        const filePath = `${folderPath}/${file}`;
        const content: string = fs.readFileSync(filePath, 'utf-8');
        await this.saveDatabase(content, file);
        const newFile = file.replace('.txt', '_saved.txt');
        fs.rename(`${folderPath}/${file}`, `${folderPath}/${newFile}`);
      }
    }
  }

  // Lưu dữ liệu vào database
  private async;
  saveDatabase(content: string, file: string) {
    const contents = content.split('\n');
    contents.map(async (content, index) => {
      const name = contents[0].replace('\r', '');
      if (index > 2 && content !== '') {
        const record = content.replace('\r', '').split('\t');
        await this.prisma.record.create({
          data: {
            name: name,
            fileName: file,
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
  }
}
