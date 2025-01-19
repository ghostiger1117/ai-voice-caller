import ffmpeg from 'fluent-ffmpeg';
import { logger } from '../utils/logger';
import axios from 'axios';
import { Readable } from 'stream';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export class AudioProcessor {
  async processRecording(recordingUrl: string): Promise<Buffer> {
    try {
      // Download recording
      const response = await axios.get(recordingUrl, {
        responseType: 'arraybuffer'
      });
      
      // Create temp file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'audio-'));
      const inputPath = path.join(tempDir, 'input.wav');
      const outputPath = path.join(tempDir, 'output.mp3');
      
      // Save input file
      await fs.writeFile(inputPath, response.data);
      
      // Process audio
      await this.processAudioFile(inputPath, outputPath);
      
      // Read processed file
      const processedBuffer = await fs.readFile(outputPath);
      
      // Cleanup
      await fs.rm(tempDir, { recursive: true });
      
      return processedBuffer;
    } catch (error) {
      logger.error({ error }, 'Failed to process recording');
      throw error;
    }
  }

  private processAudioFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => resolve())
        .on('error', reject)
        .save(outputPath);
    });
  }
} 