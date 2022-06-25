import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Item, List, State, User, Users } from 'src/app/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HelperService } from 'src/app/services/helper.service';
import { StoreService } from 'src/app/services/store.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent implements OnInit, OnDestroy {

  @Input() item: Partial<Item>;
  @Input() items: Partial<Item>[];
  @Input() users: Users;
  @Input() list: Partial<List>;
  @Input() userLogged: Partial<User>;

  formGroup: FormGroup;
  subs: Subscription;
  state: Partial<State>;
  constructor(
    public helper: HelperService,
    private ui: UiService,
    private store: StoreService,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private firebase: FirebaseService
  ) {
    this.state = {};
    this.subs = new Subscription();
    this.subs.add(
      this.store.getState().subscribe(state => {
        this.state = state;
      })
    );
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      description: [this.item?.name, [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  updateItem(item: Partial<Item>) {
    const oldName = item.name;
    const message = `${this.userLogged.username} ha editado ${oldName} por ${item.name}`;
    const users = Object.keys(this.users);
    item.name = this.formGroup.value.description;
    this.firebase.updateItem(item).then(() => {
      this.firebase.addNotification(
        message,
        users
      );
    });
    this.modalCtrl.dismiss();
  }

  async addItem() {
    const loading = await this.ui.loading();
    const item = this.itemBuilder();
    this.items.unshift(item);
    this.firebase.addItem(item).then(async (data) => {
      this.items[0].id = data.id;
      this.close();
      await loading.dismiss();
    });
  }

  close() {
    const state = { ...this.state };
    delete state.addItem;
    this.store.updateState(state);
    this.modalCtrl.dismiss();
  }

  private itemBuilder(): Partial<Item> {
    return {
      name: this.formGroup.value.description,
      user: this.userLogged.id,
      listId: this.list.id,
    };
  }
}
