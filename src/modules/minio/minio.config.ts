import { registerAs } from '@nestjs/config';
import { ClientOptions } from 'minio';

export default registerAs(
  'minio',
  () =>
    ({
      endPoint: process.env.MINIO_ENDPOINT,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      region: process.env.MINIO_REGION,
      useSSL: !(process.env.MINIO_DISABLE_SSL === 'true'),
    } as ClientOptions),
);
