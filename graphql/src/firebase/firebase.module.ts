import { Bucket, Storage } from '@google-cloud/storage';
import { FIRESTORE_INSTANCE } from '@hgraph/storage';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { container } from 'tsyringe';
import { config } from '../config';
import { FirebaseAuthService } from './firebase-auth.service';

@Module({
  providers: [FirebaseAuthService],
  exports: [FirebaseAuthService],
})
export class FirebaseModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    const firebaseConfig = config.FIREBASE_CREDENTIAL;
    admin.initializeApp({
      storageBucket,
      ...(firebaseConfig
        ? { credential: admin.credential.cert(firebaseConfig) }
        : {}),
    });
    const firestore = admin.firestore();
    firestore.settings({ ignoreUndefinedProperties: true });
    container.registerInstance(FIRESTORE_INSTANCE, firestore);
    if (storageBucket) {
      const storage = new Storage();
      container.registerInstance(Bucket, storage.bucket(storageBucket));
    }
  }
}
