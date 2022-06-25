import { Injectable } from '@angular/core';
import { Observable, pipe } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { take } from 'rxjs/operators';
import { Item, User } from '../interfaces';
import { Timestamp } from 'firebase/firestore';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  collection: AngularFirestoreCollection;
  constructor(
    private storage: Storage,
    private db: AngularFirestore) {
  }

  getLists(uid: string) {
    return this.db
      .collection('lists', (ref) =>
        ref.where('users', 'array-contains', uid)
      )
      .valueChanges({ idField: 'id' })
      .pipe(take(1));
  }

  getItems(listId: string): Observable<any> {
    return this.db
      .collection('items', (ref) =>
        ref.where('listId', '==', listId)
          .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }

  addItem(item: Partial<Item>) {
    item.updatedAt = this.getTimestamp();
    item.createdAt = this.getTimestamp();
    this.collection = this.db.collection('items');
    return this.collection.add(item);
  }

  updateItem(item: Partial<Item>) {
    item.updatedAt = Timestamp.fromDate(new Date());
    this.collection = this.db.collection('items');
    return this.collection.ref.doc(item.id).update(item);
  }

  deleteItem(uid: string) {
    this.collection = this.db.collection('items');
    return this.collection.ref.doc(uid).delete();
  }


  getUsers(users: string[]) {
    return this.db
      .collection('users', (ref) =>
        ref.where('id', 'in', users)
      )
      .valueChanges({ idField: 'id' });
  }

  getUser(uid: string) {
    return this.db
      .collection('users', (ref) =>
        ref.where('id', '==', uid)
      )
      .valueChanges({ idField: 'id' })
      .pipe(take(1));
  }


  addNotification(message: string, users: string[]) {
    this.storage.get('user').then((user: User) => {
      const notification = {
        createdAt: this.getTimestamp(),
        sender: user.id,
        message,
        receivers: users
      };
      this.collection = this.db.collection('notifications');
      return this.collection.add(notification);
    });

  }

  getNotifications(userId: string): Observable<any> {
    return this.db
      .collection('notifications', (ref) =>
        ref
          .where('sender', '!=', userId)
          .where('receivers', 'array-contains', userId)
          .orderBy('sender', 'desc')
          .orderBy('createdAt', 'desc')
          .limit(15)
      )
      .valueChanges({ idField: 'id' });
  }

  private getTimestamp(date: Date = new Date()): Timestamp {
    return Timestamp.fromDate(date);
  }
}