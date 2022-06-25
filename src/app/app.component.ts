import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { StoreService } from './services/store.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private storage: Storage,
    private store: StoreService
  ) { 
    this.store.setState();
    this.storage.create()
  }
}
