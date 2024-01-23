import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import OneSignal from 'onesignal-cordova-plugin';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  constructor( private alertCtrl: AlertController ) { }

// Call this function when your app starts
OneSignalInit(): void {
  // Uncomment to set OneSignal device logging to VERBOSE  
  // OneSignal.Debug.setLogLevel(6);
  
  // Uncomment to set OneSignal visual logging to VERBOSE  
  // OneSignal.Debug.setAlertLevel(6);

  // NOTE: Update the init value below with your OneSignal AppId.

  // OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");
  OneSignal.initialize(environment.onesignal.appId);
  
  
  let myClickListener = async function(event: any) {
        let notificationData = JSON.stringify(event);
        console.log(notificationData);
    };
  OneSignal.Notifications.addEventListener("click", myClickListener);
  

  // Prompts the user for notification permissions.
  //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 7) to better communicate to your users what notifications they will get.
  // OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
  //   console.log("User accepted notifications: " + accepted);
  // });
  }
  async OneSignalPermission(msg: string = ' '){
    try {
      const hasPermission = OneSignal.Notifications.hasPermission();
      console.log('hasPermission', hasPermission);
      if(!hasPermission) {
        this.showAlert(msg);
      }
    } catch(e) {
      throw(e);
    }
  }

  async requestPermission() {
    try {
      const permission = await OneSignal.Notifications.canRequestPermission();
      console.log('permission', permission);
      if (permission) {
        const accepted = await OneSignal.Notifications.requestPermission(true);
        console.log("Usuario acepto notificacion" + accepted);
      } else {
        console.log('permiso denegado', permission);
        this.OneSignalPermission();
      }
    } catch(e){
      throw(e);
    }
  }

  showAlert( msg: string ) {
    this.alertCtrl.create({
      header: `Allow Push Notifications${msg}`,
      message: 'Por favor permita que reciba notificaciones',
      buttons: [{
        text: 'No permitir',
        // role: 'Cancel',
        handler: () => {
          console.log('Confirmar cancelar');
          this.OneSignalPermission('(Es obligatorio)');
        }
      }, {
        text: 'Permitir',
        handler: () => {
          this.requestPermission();
        }
      }],
    })
    .then(alertEl => alertEl.present());
  }
}
