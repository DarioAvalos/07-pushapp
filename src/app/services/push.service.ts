import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import OneSignal from 'onesignal-cordova-plugin';
import { catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  constructor(private alertCtrl: AlertController,
    private http: HttpClient) { }

  // Call this function when your app starts
  OneSignalInit(): void {
    // Uncomment to set OneSignal device logging to VERBOSE  
    // OneSignal.Debug.setLogLevel(6);

    // Uncomment to set OneSignal visual logging to VERBOSE  
    // OneSignal.Debug.setAlertLevel(6);

    // NOTE: Update the init value below with your OneSignal AppId.

    // OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");
    OneSignal.initialize(environment.onesignal.appId);


    let myClickListener = async function (event: any) {
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
  async OneSignalPermission(msg: string = ' ') {
    try {
      const hasPermission = OneSignal.Notifications.hasPermission();
      console.log('hasPermission', hasPermission);
      if (!hasPermission) {
        this.showAlert(msg);
      }
    } catch (e) {
      throw (e);
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
    } catch (e) {
      throw (e);
    }
  }

  showAlert(msg: string) {
    this.alertCtrl.create({
      header: `Permiso de Push Notifications ${msg}`,
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

  sendNotification( msg: string, title: string, data: any = null, external_id?: any ) {

    let body: any = {
      app_id: environment.onesignal.appId,
      name:'test',
      target_channel: "push",
      headings: { es: title },
      contents: { es: msg },
      android_channel_id: environment.onesignal.android_channel_id,
      small_icon: 'mipmap/ic_launcher_round',
      large_icon: 'mipmap/ic_launcher_round',
      // filters:[
      //   {
      //     field: 'tag',
      //     key: 'type',
      //     relation: '=',
      //     value: 'user'
      //   },
      // ],
      //data: { notification_info: 'prueba de notificacion' },
      data: data,
      // included_segments: [ 'Activa Subscripcion', 'Total Subscripcion'],
    };

    if ( external_id ) {
      // dispositivo especifico o dispositivos
      body = {
        ...body,
        include_aliases: {
          external_id: external_id
        },

      };
    }else {
      body = {
        ...body,
        included_segments: ['Active Subscripcion', 'Total Subscricion'],
      }
    }

    const headers = new HttpHeaders()
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${environment.onesignal.restApiKey}`);
    return this.http.post<any>(
      'https://onesignal.com/api/v1/notifications', //pass any object
      body, 
      { headers: headers }
    );
  }

  // onesignal autenticacion
  
  login(uid: string) {
    OneSignal.login(uid);
  }

  logout() {
    OneSignal.logout();
  }

  //onesignal
  createOneSignalUser(uid: string) {
    const app_id = environment.onesignal.appId;

    const body = {
      properties: {
        tags: { type: 'user', uid: uid }
      },
      identity: {
        external_id: uid
      }
    };

    const headers = new HttpHeaders()
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${environment.onesignal.restApiKey}`);

    return this.http.post<any>(
      `https://onesignal.com/api/v1/apps/${app_id}/users`,
      body,
      {headers}
    );
  }

  checkOneSignalUserIdentity(uid: string) {
    const app_id = environment.onesignal.appId;

    const headers = new HttpHeaders()
      .set('accept', 'application/json')
    
    return this.http.get<any>(
      `https://onesignal.com/api/v1/apps/${app_id}/users/by/external_id/${uid}/identity`,
      {headers}
    ).pipe(
      catchError((e) => {
        return of (false);
      })
    );
  }

  deleteOneSignalUser(uid: string) {
    const app_id = environment.onesignal.appId;

    const headers = new HttpHeaders()
      .set('accept', 'application/json')
    
    return this.http.delete<any>(
      `https://onesignal.com/api/v1/apps/${app_id}/users/by/external_id/${uid}`,
      {headers}
    ).pipe(
      catchError((e) => {
        return of (false);
      })
    );
  }
}
