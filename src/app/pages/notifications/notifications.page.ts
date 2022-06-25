import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Notification, State, User } from 'src/app/interfaces';
import { HelperService } from 'src/app/services/helper.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnDestroy, OnInit {

  notifications: Notification[];
  state: Partial<State>;
  subs: Subscription;
  readed: boolean;
  userLogged: Partial<User>;
  firstInResponse: any = [];
  lastInResponse: any = [];
  hideLoadMore: boolean;

  constructor(
    public helper: HelperService,
    private store: StoreService,
    private storage: Storage,
    private db: AngularFirestore
  ) {

    this.state = {};
    this.subs = new Subscription();
    this.notifications = [];
    this.store.getState().subscribe(state => {
      this.state = state;
    });
  }

  async ngOnInit(): Promise<void> {
    this.userLogged = await this.storage.get('user');
    this.loadItems();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ionViewWillLeave() {
    this.store.updateState({ ...this.state, newNotifications: false });
  }


  loadItems() {
    this.db.collection('notifications', (ref) =>
      ref
        .where('receivers', 'array-contains', this.userLogged.id)
        .orderBy('createdAt', 'desc')
        .limit(7)
    ).get()
      .pipe(take(1))
      .subscribe(response => {
        const docs = response.docs;
        docs.forEach(d => {
          const notification = d.data() as Notification;
          if (notification.sender !== this.userLogged.id) this.notifications.push(d.data() as any);
        });
        this.firstInResponse = docs[0];
        this.lastInResponse = docs[docs.length - 1];
      });
  }

  nextPage(event) {
    this.db.collection('notifications', (ref) =>
      ref
        .where('receivers', 'array-contains', this.userLogged.id)
        .orderBy('createdAt', 'desc')
        .limit(4)
        .startAfter(this.lastInResponse)

    ).get()
      .subscribe(response => {
        if (event) event.target.complete();
        const docs = response.docs;
        if (!docs.length) {
          if (event) event.target.disabled = true;
          this.hideLoadMore = true;
          return;
        }
        this.firstInResponse = docs[0];
        this.lastInResponse = docs[docs.length - 1];
        docs.forEach(d => {
          const notification = d.data() as Notification;
          if (notification.sender !== this.userLogged.id) this.notifications.push(d.data() as any);
        });
      });
  }

}
