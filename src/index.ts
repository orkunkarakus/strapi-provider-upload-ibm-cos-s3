import * as ibm from "ibm-cos-sdk";

type Config = {
  apiKey: string;
  serviceInstanceId: string;
  endpoint: string;
  bucket: string;
  acl: ibm.S3.Types.ObjectCannedACL;
  folder?: string;
};

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
      `https://${config.endpoint}/${config.bucket}/${key}`;

    return {
      async upload(file:any) {
        await cos
          .putObject({
            Key: file.hash,
            Body: Buffer.from(file.buffer, "binary"),
            ACL: config.acl,
            ContentType: file.mime,
            Bucket: config.bucket,
          })
          .promise();

        const key = getFileKey(file.hash, file.ext, config.folder);
        file.url = getUrl(key);
      },

      async delete(file:any) {
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