import { Component, inject } from '@angular/core';
import { PushService } from '../services/push.service';
import { lastValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  onesignal = inject(PushService);

  constructor(private toastCtrl: ToastController) { }

  ngOnInit() {
    console.log("ngoninit");
    if (Capacitor.getPlatform() != 'web') this.PushService();

  }
  async PushService() {
    try {
      await this.onesignal.OneSignalPermission();
    } catch(e) {
      console.log(e);
    }
    // throw new Error('Method not implemented.');
  }

  async createOneSignalUser() {
    try {
      const data = await this.getStorage('auth');
      const randomNumber = this.generateRandomString(20);
      if(!data?.value) {
        await lastValueFrom(this.onesignal.createOneSignalUser(randomNumber));
        await Preferences.set({ key:'auth', value: randomNumber });
        return;
      }
      console.log('external ide: ',data.value);
      const response = await lastValueFrom(this.onesignal.checkOneSignalUserIdentity(data.value));
      if(!response) {
        // await lastValueFrom(this.onesignal.createOneSignalUser(randomNumber));
        // await Preferences.set({ key:'auth', value: randomNumber });
        this.createUserAndLogin();
      }else {
        const { identity } = response;
        console.log('identity', identity);
        if(!identity?.external_id) {
          // const result = await lastValueFrom(this.onesignal.createOneSignalUser(randomNumber));
          // console.log('onesignal usuario creado: ', result);
          // await Preferences.set({ key:'auth', value: randomNumber });
          // this.showToast('Usuario creado en onesignal');
          this.createUserAndLogin();
        }else {
          this.onesignal.login(identity?.external_id);
          this.showToast('Usuario listo para registrar en onesignal');
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  async createUserAndLogin() {
    try {
      const randomNumber = this.generateRandomString(20);
      console.log('stored number: ', randomNumber);
      await lastValueFrom(this.onesignal.createOneSignalUser(randomNumber));
      await Preferences.set({ key:'auth', value: randomNumber });
      this.onesignal.login(randomNumber);
      this.showToast('Usuario creado en onesignal');
    }catch(e) {
      throw(e)
    }
  }

  async showToast(msg: string, color: string = 'success', duration = 3000) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // onesignalPermission en reemplazo de oneSignal
  async onesignalPermission() {
    await this.onesignal.OneSignalPermission();
    const randomNumber = this.generateRandomString(10);

    const data = await this.getStorage('auth');

    if (data?.value) {
      return;
    }

    await Preferences.set({ key: 'auth', value: randomNumber });

    await lastValueFrom(this.onesignal.createOneSignalUser(randomNumber));
  }

  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++ ) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  async deleteOneSignalUser() {
    try {
      const data = await this.getStorage('auth');
      if(!data?.value) return;
      console.log('external id: ',data.value);
      const response = await lastValueFrom(this.onesignal.checkOneSignalUserIdentity(data.value));
      const { identity } = response;
      console.log('identity', identity);
      await lastValueFrom(this.onesignal.deleteOneSignalUser(identity?.external_id));
      this.showToast('Usuario eliminado de onesignal');
    } catch(e) {
      console.log(e);
    }
  }


  getStorage(key: string) {
    return Preferences.get({ key: key });
  }

  async sendNotificationSpecificDevice() {
    try {
      const data = await this.getStorage('auth');

      if (data?.value) {
      
       await lastValueFrom (
          this.onesignal.sendNotification(
            'Esto es una prueba de mensaje', 
            'Prueba de mensaje', 
            { type: 'user1' }, 
            //[data.value]
            "CedxoOHotQlda72uYF6B"
          )
        );
      }
        console.log(data);
    } catch (e) {
      console.log(e);
    }
  }

  async sendNotificationAllUsers() {
    try {
        await lastValueFrom (
          this.onesignal.sendNotification(
            'Esto es una prueba de mensaje a todos los usuarios', 
            'Prueba de mensaje para usuarios', 
            { type: 'user12' }
          )
        );
    } catch (e) {
      console.log(e);
    }
  }

  async sendNotificationSpecificDeviceFromWeb() {
    const data='lsLLKjIl4UU4XgduCcTN'
    try {
       await lastValueFrom (
          this.onesignal.sendNotification(
            'Esto es una prueba de mensaje', 
            'Prueba de mensaje', 
            { type: 'user1' }, 
            data
          )
        );
        console.log(data);
    } catch (e) {
      console.log(e);
    }
  }

}
