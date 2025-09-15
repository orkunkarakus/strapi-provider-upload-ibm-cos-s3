import * as ibm from "ibm-cos-sdk";
import type { ReadStream } from 'node:fs';

type Config = {
  apiKey: string;
  serviceInstanceId: string;
  endpoint: string;
  bucket: string;
  acl: ibm.S3.Types.ObjectCannedACL;
  folder?: string;
};

export type File = {
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  sizeInBytes: number;
  url: string;
  previewUrl?: string;
  path?: string;
  provider?: string;
  provider_metadata?: Record<string, unknown>;
  stream?: ReadStream;
  buffer?: Buffer;
}

export default {
  init: (config: Config) => {
    const cos = new ibm.S3({
      apiKeyId: config.apiKey,
      serviceInstanceId: config.serviceInstanceId,
      endpoint: config.endpoint,
    });

    const getFileKey = (key: string, ext:string, folder?: string) =>
      folder ? `${folder}/${key}${ext}` : `${key}${ext}`;

    const getUrl = (key: string) =>
      `https://${config.bucket}.${config.endpoint}/${key}`;


    const upload = async(file:File) => {
        const key = getFileKey(file.hash, file.ext, config.folder);

        await cos
          .putObject({
            Key: key,
            Body: file.stream || Buffer.from(file.buffer as any, 'binary'),
            ACL: config.acl,
            ContentType: file.mime,
            Bucket: config.bucket,
          })
          .promise();

        file.url = getUrl(key);
    }

    return {
      upload(file:File) {
       return upload(file);
      },

      uploadStream(file: File) {
        return upload(file);
      },

      async delete(file:File) {
        const key = getFileKey(file.hash, file.ext, config.folder);

        return cos
          .deleteObject({
            Key: key,
            Bucket: config.bucket,
          })
          .promise();
      },

      async isPrivate() {
        return config.acl === "private";
      },
    };
  },
};