import { forwardRef, Module } from '@nestjs/common';
import { ReadFileService } from './read-file.service';
import { ReadFileController } from './read-file.controller';
import { join } from 'path';
import * as process from 'process';
import * as chokidar from 'chokidar';
import { PrismaService } from 'nestjs-prisma';
import { AppService } from '../app.service';
import { AppModule } from '../app.module';

@Module({
  // controllers: [ReadFileController],
  providers: [ReadFileService],
  imports: [forwardRef(() => AppModule)],
})
export class ReadFileModule {
  constructor(private prisma: PrismaService, private appService: AppService) {}
  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') {
      // const folderPaths = [
      //   join(process.cwd(), './local_txt'),
      //   join(process.cwd(), './local_txt1'),
      // ];
      const folderPaths = ['D:/DAM CA MAU/DATA', 'Y:/', 'X:/'];
      for (const folderPath of folderPaths) {
        await this.appService.readFileContents(folderPath);
      }
      // Theo dõi sự thay đổi trong thư mục và cập nhật nội dung của các tệp tin .txt
      chokidar.watch(folderPaths, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        usePolling: true,
        ignoreInitial: true
      }).on('all', async (event, path) => {
        if (event === 'addDir' || event === 'change') {
          console.log(event + path)
          await this.appService.readFileContents(path);
        }
      });
    }
  }
}
