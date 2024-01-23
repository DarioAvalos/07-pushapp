import { Component, inject } from '@angular/core';
import { PushService } from './services/push.service';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  private platform = inject(Platform);
  private onesignal = inject (PushService);

  constructor() {
    this.platform.ready().then(() => {
      if(Capacitor.getPlatform() != 'web')
        this.onesignal.OneSignalInit();
    });
  }
}
