import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertController, IonItemSliding, IonModal, ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { interval, Subscription } from 'rxjs';
import { ItemDetailComponent } from 'src/app/components/item-detail/item-detail.component';
import { Item, List, State, User, Users } from 'src/app/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HelperService } from 'src/app/services/helper.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  @ViewChild('modal') modal: IonModal;

  list: Partial<List>;
  items: Partial<Item>[];
  updates: Partial<Item>[];
  itemSelected: Partial<Item>;
  users: Users = {};
  userLogged: Partial<User>;
  formGroup: FormGroup;
  loading: boolean;
  subs: Subscription;
  state: Partial<State>;
  toast: HTMLIonToastElement;

  constructor(
    public helper: HelperService,
    private firebase: FirebaseService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private store: StoreService,
    private storage: Storage,
    private toastController: ToastController
  ) {
    this.list = {};
    this.items = null;
    this.updates = null;
    this.itemSelected = null;
    this.loading = true;
    this.users = {};
    this.subs = new Subscription();
    this.setToastInfoInterval();
    this.subscribeAppState();
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async deleteItem(item: Partial<Item>, i: number, slidingItem: IonItemSliding): Promise<void> {
    slidingItem.close();
    const alert = await this.alertCtrl.create({
      message: '¿Seguro que quieres borrar este elemento?',
      cssClass: 'delete-alert',
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.items.splice(i, 1);
            this.firebase.deleteItem(item.id).then();
          }
        }
      ]
    });
    await alert.present();
  }

  async toastInfo(): Promise<void> {
    if (!this.toast) {
      this.toast = await this.toastController.create({
        message: 'Hay actualizaciones pendientes en tu lista de la compra',
        position: 'top',
        cssClass: 'toast-info',
        buttons: [
          {
            icon: 'refresh-outline',
            handler: () => {
              this.loading = true;
              this.firebase.getItems(this.list.id).subscribe(async (items) => {
                this.updates = null;
                this.items = items;
                this.loading = false;
              });
            }
          },
          {
            icon: 'close',
            handler: () => console.log('close')
          }
        ]
      });
      await this.toast.present();
      this.toast.onDidDismiss().then(() => {
        this.toast = null;
      });
    }
  }

  toggleIonCheck(e, item: Partial<Item>): void {
    item.checked = e.detail.checked;
    this.firebase.updateItem(item);
  }

  async openDetailModal(item, slidingItem?: IonItemSliding): Promise<void> {
    if (slidingItem) slidingItem.close();
    this.itemSelected = item;
    this.userLogged = await this.storage.get('user');
    const modal = await this.modalCtrl.create({
      component: ItemDetailComponent,
      initialBreakpoint: 0.40,
      breakpoints: [0, 0.25, 0.5, 0.75],
      componentProps: {
        item,
        items: this.items,
        list: this.list,
        userLogged: this.userLogged,
        users: this.users
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.itemSelected = null;
      this.formGroup = null;
    });
  }

  private setToastInfoInterval(): void {
    const source = interval(300000);
    this.subs.add(source.subscribe(() => {
      if (this.updates) this.toastInfo();
    }));
  }

  private subscribeAppState(): void {
    this.subs.add(
      this.store.getState().subscribe(state => {
        this.state = state;
        if (state.addItem) this.openDetailModal(null, null);
      })
    );
  }

  private async loadData(): Promise<void> {
    this.userLogged = await this.storage.get('user');
    this.firebase.getLists(this.userLogged.id).subscribe(lists => {
      this.list = lists[0];

      this.firebase.getUsers(this.list.users).subscribe(users => {
        users.forEach(user => {
          this.users[user.id] = user['username'];
        });
      });

      this.firebase.getItems(this.list.id).subscribe(async (items) => {
        console.log(1, this.state);
        if (!this.items?.length) {
          console.log(2);
          this.items = items;
          this.store.updateState({ ...this.state, dataLoaded: true });
          this.loading = false;
          return;
        }
        console.log(3);

        if (
          this.state.dataLoaded && this.items?.length !== items?.length) {
          console.log(4);
          this.updates = items;
          this.toastInfo();
        }
      });
    });
  }
}
