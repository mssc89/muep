import { Component, OnInit, Inject } from '@angular/core';

import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.scss'],
})
export class AdComponent implements OnInit {

  constructor() {
  }

  async ngOnInit() {
    const { status } = await AdMob.trackingAuthorizationStatus();

    const options: BannerAdOptions = {
      adId: '',
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      //isTesting: true
      // npa: true
    };
    AdMob.showBanner(options);
  }

}
