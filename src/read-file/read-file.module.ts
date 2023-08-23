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
      const folderPath = join(process.cwd(), './local_txt');

      // Đọc nội dung của các tệp tin .txt lần đầu tiên
      await this.readFileContents(folderPath);

      // Theo dõi sự thay đổi trong thư mục và cập nhật nội dung của các tệp tin .txt
      // chokidar.watch(folderPath).on('all', async (event, path) => {
      //   if (
      //     event === 'add' &&
      //     path.endsWith('.txt') &&
      //     !path.includes('saved')
      //   ) {
      //     const contents = fs.readFileSync(path, 'utf-8');
      //     console.log(path)
      //     // await this.saveDatabase(contents, path);
      //     // const newPath = path.replace('.txt', '_saved.txt');
      //     // fs.rename(path, newPath);
      //   }
      // });
    }
  }

  // đọc nội dung file txt
  private async readFileContents(folderPath: string) {
    const shortcuts = this.readShortcuts(folderPath);
    if (shortcuts.length > 0) {
      for (const file of shortcuts) {
        if (file.endsWith('.txt') && !file.includes('saved')) {
          await this.readTXT(folderPath, file);
        } else {
          const newFolderPath = folderPath + '/' + file;
          await this.readFileContents(newFolderPath);
        }
      }
    }
  }

  private readShortcuts(dir: any) {
    const shortcuts = fs.readdirSync(dir);
    return shortcuts.filter((file: string) => file !== '.DS_Store');
  }
  private async readTXT(folderPath: string, file: string) {
    const filePath = `${folderPath}/${file}`;
    console.log(filePath);
    const contents = await this.extractSignalData(filePath);

    console.log(contents);

    // const content: string = fs.readFileSync(filePath, 'utf-8');
    // await this.saveDatabase(content, file);
    // console.log(content);
    // const newFile = file.replace('.txt', '_saved.txt');
    // fs.rename(`${folderPath}/${file}`, `${folderPath}/${newFile}`);
  }

  // Lưu dữ liệu vào database
  private async saveDatabase(content: string, file: string) {
    const contents = content.split('\n');
    console.log(content);
    contents.map(async (content, index) => {
      const name = contents[0].replace('\r', '');
      // if (index > 2 && content !== '') {
      //   const record = content.replace('\r', '').split('\t');
      //   await this.prisma.record.create({
      //     data: {
      //       name: name,
      //       fileName: file,
      //       action: record[0] ? record[0] : null,
      //       sampleId: record[1] ? record[1] : null,
      //       trueValue: record[2] ? parseFloat(record[2]) : null,
      //       Conc: record[3] ? parseFloat(record[3]) : null,
      //       Abs: record[4] ? parseFloat(record[4]) : null,
      //       SG: record[5] ? parseFloat(record[5]) : null,
      //       date:
      //         record[6] && record[7]
      //           ? new Date(record[6] + ' ' + record[7])
      //           : null,
      //     },
      //   });
      // }
    });
  }

  async extractSignalData(filePath: string): Promise<any[]> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');

      const signal1Matches = fileContent.match(
        /Signal 1:(.*?)Totals\s*:\s*([\d.]+)/s
      );
      const signal2Matches = fileContent.match(
        /Signal 2:(.*?)Totals\s*:\s*([\d.]+)/s
      );

      if (signal1Matches && signal2Matches) {
        const signal1Data = this.extractSignal1Data(signal1Matches[1].trim());
        const signal2Data = this.extractSignal2Data(signal2Matches[1].trim());

        return [...signal1Data, ...signal2Data];
      } else {
        throw new Error('Signal data not found in the provided text.');
      }
    } catch (error) {
      throw new Error(`Error reading or processing the file: ${error.message}`);
    }
  }

  private extractSignal1Data(signalData: string): any[] {
    return this.extractDataFromSignalSection(signalData);
  }

  private extractSignal2Data(signalData: string): any[] {
    return this.extractDataFromSignalSection(signalData);
  }

  private extractDataFromSignalSection(signalData: string): any[] {
    const lines = signalData.split('\n');
    const data = [];

    for (const line of lines) {
      const [retTime, type, area, amtArea, norm, grp, name] = line
        .trim()
        .split(/\s+/);
      data.push({ retTime, type, area, amtArea, norm, grp, name });
    }
    return data;
  }
}
