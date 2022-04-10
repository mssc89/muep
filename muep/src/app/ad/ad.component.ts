import { Component, OnInit, Inject } from '@angular/core';
import { BrowserTestingModule } from '@angular/platform-browser/testing';

import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.scss'],
})
export class AdComponent implements OnInit {
  appMargin = 0;

  constructor() {
  }

  async ngOnInit() {
    AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: [],
      initializeForTesting: true,
    });

    const options: BannerAdOptions = {
      adId: '',
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true
      // npa: true
    };
    AdMob.showBanner(options);

    const resizeHandler = AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info: AdMobBannerSize) => {
      this.appMargin = info.height;
      if (this.appMargin > 0) {
        const body = document.querySelector('body');
        const bodyStyles = window.getComputedStyle(body);
        const safeAreaBottom = bodyStyles.getPropertyValue("--ion-safe-area-bottom");

        const app: HTMLElement = document.querySelector('ion-router-outlet');

        app.style.marginBottom = `calc(${safeAreaBottom} + ${this.appMargin}px)`;
      }
    });
  }

}
