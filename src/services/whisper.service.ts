import axios from 'axios';
import { logger } from '../utils/logger';
import FormData from 'form-data';

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'text');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    logger.info('Successfully transcribed audio with Whisper');
    return response.data;
  } catch (error) {
    logger.error({ error }, 'Error transcribing with Whisper');
    throw error;
  }
}; 