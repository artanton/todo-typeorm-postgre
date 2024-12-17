import { diskStorage } from 'multer';

// import path from 'path';
// import { fileTypeFromFile } from 'file-type';
// type validFileExtension = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

// const validFileExtensions: validFileExtension[] = ['png', 'jpg', 'jpeg'];
const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const upload = {
  storage: diskStorage({
    destination: './avatars',
    filename(req, file, cb) {
      const fileExtension: string = file.originalname.split('.').pop();
      const uniquePref = `${Date.now()}`;
      const filename = `${uniquePref}.${fileExtension}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: validMimeType[] = validMimeTypes;
    const isAllowed = allowedMimeTypes.includes(file.mimetype);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type. Only PNG, JPG, and JPEG are allowed!'),
        false,
      );
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
};

// export const FileExtensionSafe = async (
//   fullFilePath: string,
// ): Promise<boolean> => {
//   // const result = await fileTypeFromFile(fullFilePath);
//   const FileType = await import('file-type');
//   const result = await FileType.fileTypeFromFile(fullFilePath);
//   if (!result) return false;
//   const isFileTypeLegit = validFileExtensions.includes(
//     result.ext as validFileExtension,
//   );
//   const isMimeTypeLegit = validMimeTypes.includes(result.mime as validMimeType);
//   const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
//   return isFileLegit;
// };

export const removeFile = async (fullFilePath: string): Promise<void> => {
  try {
    const fs = await import('fs');
    fs.unlinkSync(fullFilePath);
  } catch (err) {
    console.error(err);
  }
};
