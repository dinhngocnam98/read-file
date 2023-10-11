import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as iconv from 'iconv-lite';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async readFileContents(folderPath: string) {
    const shortcuts = await this.readShortcuts(folderPath);
    if (shortcuts && shortcuts.length > 0) {
      for (const file of shortcuts) {
        if (
          file.toUpperCase().endsWith('.TXT') &&
          file.toUpperCase().includes('REPORT') &&
          !file.toUpperCase().includes('IRREPORT')
        ) {
          if (file.toUpperCase().includes('SAVED'))
            await this.readTXT(folderPath, file);
        } else {
          const newFolderPath = folderPath + '/' + file;
          await this.readFileContents(newFolderPath);
        }
      }
    }
  }

  private async readShortcuts(dir: any) {
    const stats = await fs.promises.stat(dir);
    if (stats.isDirectory()) {
      const shortcuts = fs.readdirSync(dir);
      return shortcuts.filter((file: string) => file !== '.DS_Store');
    }
  }
  private async readTXT(folderPath: string, file: string) {
    const filePath = `${folderPath}/${file}`;
    const contents = await this.extractSignalData(filePath);
    await this.saveDatabase(contents, folderPath);
    const newFile = file
      .replace('.txt', '_saved.txt')
      .toUpperCase();
    fs.rename(`${folderPath}/${file}`, `${folderPath}/${newFile}`);
  }

  // Lưu dữ liệu vào database
  async saveDatabase(contents: any[], folderPath: string) {
    const signalData1 = [];
    const signalData2 = [];
    for (const content of contents) {
      if (content.name_signal.includes('Signal 1')) {
        signalData1.push(content);
      } else signalData2.push(content);
    }
    if(folderPath.includes('D:/')){
      await this.prisma.gc5_reports.create({
        data:{
          folderDir: folderPath,
          signal1: signalData1,
          signal2: signalData2
        }
      })
    }
    else if(folderPath.includes('Y:/')){
      await this.prisma.gc4_reports.create({
        data:{
          folderDir: folderPath,
          signal1: signalData1,
          signal2: signalData2
        }
      })
    }
    else if(folderPath.includes('X/')){
      await this.prisma.gc2_reports.create({
        data:{
          folderDir: folderPath,
          signal1: signalData1,
          signal2: signalData2
        }
      })
    }
    
  }

  async extractSignalData(filePath: string): Promise<any[]> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      // Convert the file buffer from UTF-16 LE with BOM to UTF-8
      const fileContent = iconv.decode(fileBuffer, 'utf16-le');
      // Extract "Signal" sections
      const signalSections = fileContent.match(/Signal \d+:.+?(Totals :.+?)/gs);
      if (signalSections) {
        return this.parseSignalSections(signalSections);
      } else {
        throw new Error('Signal data not found in the provided text.');
      }
    } catch (error) {
      throw new Error(`Error reading or processing the file: ${error.message}`);
    }
  }

  parseSignalSections(signalSections: string[]): object[] {
    const parsedData = [];

    for (const signal of signalSections) {
      const lines = signal
        .trim()
        .split('\n')
        .map((line) => line.trim());

      // Extract name_signal
      const nameSignalMatch = lines[0];
      const name_signal = nameSignalMatch ? nameSignalMatch : '';

      // Extract dataRows
      const dataRows = lines.slice(4, -1);
      const signalEntries = dataRows.slice(1).map((row) => {
        const rowSplit = row.split(/\s+/).map((value) => value.trim());
        if (rowSplit.length === 6) {
          const [RetTime, type, Area, Amt_Area, Norm, Name] = rowSplit;
          return {
            name_signal,
            RetTime: parseFloat(RetTime) || null,
            type,
            Area: parseFloat(Area) || null,
            Amt_Area: parseFloat(Amt_Area) || null,
            Norm: parseFloat(Norm) || null,
            Grp: '',
            Name,
          };
        } else {
          const [RetTime, Area, Amt_Area, Norm, Name] = rowSplit;
          return {
            name_signal,
            RetTime: parseFloat(RetTime) || null,
            type: null,
            Area: parseFloat(Area) || null,
            Amt_Area: parseFloat(Amt_Area) || null,
            Norm: parseFloat(Norm) || null,
            Grp: '',
            Name,
          };
        }
      });

      // const totals_norm = lines[lines.length - 1].match(/Totals\s+:\s+(\S+)/);
      // console.log(totals_norm);
      // signalEntries.push({ totals_norm: parseFloat(totals_norm) || 0 });

      parsedData.push(...signalEntries);
    }

    return parsedData;
  }
}
