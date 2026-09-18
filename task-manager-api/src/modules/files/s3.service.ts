import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import 'multer';
import { extname } from 'path';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;

        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION')!,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
            },
        });
    }

    /**
     * Upload file to AWS S3
     * @param file The file object from Multer
     * @param folder The folder name inside S3 bucket (e.g., 'avatars')
     * @returns The public URL of the uploaded file
     */
    async uploadFile(file: Express.Multer.File, folder: string = 'avatars'): Promise<string> {
        try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const fileName = `${folder}/${uniqueSuffix}${ext}`;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3Client.send(command);

            // بناء رابط الصورة
            const region = await this.s3Client.config.region();
            return `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw new InternalServerErrorException('Failed to upload file to S3');
        }
    }

    /**
     * Delete file from AWS S3
     * @param fileUrl The full URL of the file to delete
     */
    async deleteFile(fileUrl: string): Promise<void> {
        try {
            const urlParts = fileUrl.split('.amazonaws.com/');
            if (urlParts.length !== 2) return;

            const key = urlParts[1];

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error('Error deleting file from S3:', error);
        }
    }
}