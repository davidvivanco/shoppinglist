import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) { }

  async loading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({});
    await loading.present();
    return loading;
  }

  async errorToast(
    message = '¡Algo no fue bien!'
  ) {
    const toast = await this.toastController.create({
      message,
      position: 'bottom',
      color: 'danger',
      duration: 2500
    });
    toast.present();
  }

}
