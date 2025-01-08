import { Bucket } from '@google-cloud/storage';
import { container } from 'tsyringe';

export function getDefaultStorageBucket() {
  return container.resolve(Bucket);
}
