import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { State, User } from 'src/app/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {

  userLogged: Partial<User>;
  notifications: Notification[];
  state: Partial<State>;
  subs: Subscription;

  constructor(
    private storage: Storage,
    private store: StoreService,
    private nav: NavController,
    private firebase: FirebaseService
  ) {
    this.state = {};
    this.subs = new Subscription();
    this.notifications = [];
    this.store.getState().subscribe(state => {
      this.state = state;
    });
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }

  async ngOnInit() {
    this.userLogged = await this.storage.get('user');
    this.firebase.getNotifications(this.userLogged.id).subscribe(notifications => {
      if (this.state?.notifications?.length) {
        const totalNotifications = notifications.length - this.state?.notifications.length;
        this.store.updateState({
          ...this.state,
          newNotifications: true,
          totalNotifications
        });

      }
      this.store.updateState({ ...this.state, notifications });
    });

  }

  goToNotifications() {
    this.nav.navigateForward('notifications');
  }

}
