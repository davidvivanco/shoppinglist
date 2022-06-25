import { Injectable } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Timestamp } from 'firebase/firestore';
import * as moment from 'moment';
import { Item, ItemKeys, List, User } from '../interfaces';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private firebase: FirebaseService
  ) { }


  getDateFromNow(ele: Partial<Item> & Partial<Notification>): string {
    const date = ele.updatedAt ? ele.updatedAt.toMillis() : ele.createdAt.toMillis();
    moment.locale('es');
    return moment(date).fromNow();
  }

  async setUrgency(
    item: Partial<Item>,
    list: Partial<List>,
    userLogged: Partial<User>,
    slidingItem?: IonItemSliding) {
    if (slidingItem) slidingItem.close();
    item.urgent = !item.urgent;
    try {
      await this.firebase.updateItem(item);
      const message = `${userLogged.username} ha marcado ${item.name} ${item.urgent ? 'como urgente' : 'como no urgente'} `;
      this.firebase.addNotification(message, list.users);
    } catch (error) {
      
    }
  }


}
