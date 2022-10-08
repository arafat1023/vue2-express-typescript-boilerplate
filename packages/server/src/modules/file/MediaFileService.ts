import fs from 'fs';
import path from 'path';

class MediaFileService {
  static async removeMediaFile(
    fileName: string,
  ): Promise<{success: boolean, exist: boolean; message: string}> {
    const mediaFullPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'files',
      fileName,
    );

    const existFile = fs.existsSync(mediaFullPath);

    if (!existFile) {
      return { success: true, exist: false, message: 'Media file doesn\'t exist.' };
    }

    fs.unlinkSync(mediaFullPath);

    return {
      success: true,
      exist: true,
      message: 'Media file removed.',
    };
  }
}

export default MediaFileService;
