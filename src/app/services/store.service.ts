import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { State } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

 
  private state$: Subject<Partial<State>>;

  setState(state: Partial<State> = {}) {
    this.state$ = new BehaviorSubject<Partial<State>>(state);
  }

  getState() {
    if (!this.state$) this.setState();
    return this.state$.asObservable();
  }

  updateState(state: Partial<State>) {
    if (!this.state$) this.setState();
    this.state$.next(state);
  }

  completeState() {
    if (this.state$) this.state$.complete();
  }

  resetState() {
    this.state$ = new BehaviorSubject<Partial<State>>({});
  }


  stateIsComplete(): boolean {
    return this.state$ ? this.state$.isStopped : true;
  }

  clear(){
    this.setState({});
  }
}
