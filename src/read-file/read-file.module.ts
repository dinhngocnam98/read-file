import { forwardRef, Module } from '@nestjs/common';
import { ReadFileService } from './read-file.service';
import { ReadFileController } from './read-file.controller';
import path, { join } from 'path';
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
    // const folderPaths = [
    //   join(process.cwd(), './local_txt'),
    //   join(process.cwd(), './local_txt1'),
    // ];

    const folderPaths = [
      'D:/DAM CA MAU/DATA',
      'V:/HPLC',
      'Y:',
      'U:',
      'X:',
      'S:',
      'T:',
      'R:',
      'W:',
    ];

    const promises = [];
    folderPaths.forEach((folderPath) => {
      const promise = this.appService.readFileContents(folderPath);
      promises.push(promise);
    });
    await Promise.all(promises)
      .then(() => console.log('All shortcuts had read!'))
      .catch((error) => console.error(error));

    // //Doc lai file loi
    const intervalInMilliseconds = 10 * 60 * 1000;
    setInterval(async () => {
      const promisesErrorDir = [];

      if (errorFolderWatchers.length > 0) {
        console.log('errorFolderWatchers', errorFolderWatchers);
        errorFolderWatchers.forEach((folderPath) => {
          watcherChokidar(folderPath);
        });
      }
      if (this.appService.errorDir.length > 0) {
        console.log('errorDir', this.appService.errorDir);
        this.appService.errorDir.forEach((folderPath) => {
          const promise = this.appService.readFileContents(folderPath);
          promisesErrorDir.push(promise);
        });
        await Promise.all(promisesErrorDir).catch((error) =>
          console.error(error)
        );
      }
    }, intervalInMilliseconds);

    // Theo dõi sự thay đổi trong thư mục và cập nhật nội dung của các tệp tin .txt
    const watchers = [];
    const errorFolderWatchers = [];
    const watcherChokidar = (folderPath: string) => {
      const watcher = chokidar.watch(folderPath, {
        persistent: true,
        usePolling: true,
        ignoreInitial: true,
      });

      watcher.on('error', (error) => {
        watcher.close();

        const errorFolderIndex = errorFolderWatchers.indexOf(folderPath);
        if (errorFolderIndex === -1) {
          errorFolderWatchers.push(folderPath);
        }
        const watchersIndex = watchers.indexOf(watcher);
        if (watchersIndex !== -1) {
          watchers.splice(watchersIndex, 1);
        }
      });
      watchers.push(watcher);
    };
    folderPaths.forEach((folderPath) => {
      watcherChokidar(folderPath);
    });

    watchers.forEach((watcher) => {
      watcher.on('addDir', async (path: string) => {
        const pathEdit = path.replace(/\\/g, '/').replace(':', ':/');
        await this.appService.readFileContents(pathEdit);
      });
    });
  }
}
