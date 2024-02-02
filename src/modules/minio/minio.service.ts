import { Injectable } from '@nestjs/common';
import { BucketItem, CopyConditions, Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { Observable, from, lastValueFrom } from 'rxjs';
import { mergeMap, reduce } from 'rxjs/operators';

@Injectable()
export class MinioService extends Client {
  constructor(configService: ConfigService) {
    super(configService.get('minio'));
  }

  public listObjectsV2$(
    bucketName: string,
    prefix?: string,
    recursive?: boolean,
    startAfter?: string,
  ): Observable<BucketItem> {
    return new Observable<BucketItem>((subscriber) => {
      const stream = this.listObjectsV2(
        bucketName,
        prefix,
        recursive,
        startAfter,
      );

      stream.on('data', (item) => {
        subscriber.next(item);
      });

      stream.on('error', (err) => {
        subscriber.error(err);
      });

      stream.on('end', () => {
        subscriber.complete();
      });

      return () => {
        stream.removeAllListeners();
      };
    });
  }

  public async getObjectAsBuffer(
    bucketName: string,
    objectName: string,
  ): Promise<Buffer> {
    const buffer$ = from(this.getObject(bucketName, objectName)).pipe(
      mergeMap((stream) => from(stream)),
      // reduce into a single buffer
      reduce((acc, chunk) => Buffer.concat([acc, chunk]), Buffer.alloc(0)),
    );

    return lastValueFrom(buffer$);
  }

  public async moveObject(
    bucketName: string,
    objectName: string,
    newObjectName: string,
  ) {
    const conditions = new CopyConditions();
    await this.copyObject(
      bucketName,
      newObjectName,
      `/${bucketName}/${objectName}`,
      conditions,
    );
    await this.removeObject(bucketName, objectName);
  }
}
