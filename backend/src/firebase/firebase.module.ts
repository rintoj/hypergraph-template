import { Bucket, Storage } from '@google-cloud/storage';
import { FIRESTORE_INSTANCE } from '@hgraph/storage';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { container } from 'tsyringe';

@Module({})
export class FirestoreProviderModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    const firebaseConfig = process.env.FIREBASE_CREDENTIAL;
    const appCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    admin.initializeApp({
      storageBucket,
      ...(firebaseConfig && !appCredentials
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
