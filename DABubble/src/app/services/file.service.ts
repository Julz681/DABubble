import { Injectable } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(private storage: Storage) {}

  uploadFile(
    file: File,
    path: string
  ): { percent$: Observable<number>; url$: Observable<string> } {
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file);

    const percent$ = new Observable<number>((observer) => {
      task.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next(progress);
        },
        (error: unknown) => observer.error(error),
        () => observer.complete()
      );
    });

    const url$ = new Observable<string>((observer) => {
      task.on(
        'state_changed',
        null,
        (error: unknown) => observer.error(error),
        async () => {
          try {
            const downloadUrl = await getDownloadURL(storageRef);
            observer.next(downloadUrl);
            observer.complete();
          } catch (err) {
            observer.error(err);
          }
        }
      );
    });

    return { percent$, url$ };
  }
}
