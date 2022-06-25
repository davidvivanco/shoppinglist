import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  collection: AngularFirestoreCollection;

  constructor(private db: AngularFirestore) {
    if (db) this.collection = this.db.collection('users');
  }

  add(id: string, user: Partial<User>): Promise<void> {
    return this.collection.doc(id).set(user);
  }

  getOne(id: string): Observable<Partial<User>> {
    return this.collection
      .doc(id)
      .get()
      .pipe(
        map((user) => {
          return { ...user.data(), id: user.id };
        })
      );
  }

  editUser(id: string, user: Partial<User>): Promise<void> {
    return this.collection.ref.doc(id).update(user);
  }
  
}
