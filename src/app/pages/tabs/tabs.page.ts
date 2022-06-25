import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { State } from 'src/app/interfaces';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  state: Partial<State>;
  subs: Subscription;

  constructor(
    private store: StoreService
  ) {
    this.state = {};
    this.subs = new Subscription();
    this.subs.add(this.store.getState().subscribe(state => {
      this.state = state;
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  addItem() {
    this.store.updateState({ ...this.state, addItem: true });
  }
}
