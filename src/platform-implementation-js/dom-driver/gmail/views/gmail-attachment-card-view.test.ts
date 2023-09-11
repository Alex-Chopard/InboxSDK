import { Driver } from '../../../driver-interfaces/driver';
import GmailAttachmentCardView from './gmail-attachment-card-view';
const driver: Driver = {} as Driver;
describe('getAttachmentType', () => {
  describe('UNLOADED', () => {
    it('not loaded', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo"><div id=":3e" class="aQy aUQ"></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('UNLOADED');
    });
  });
  describe('DRIVE', () => {
    it('Spreadsheet/Doc', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo"><a id=":yx" target="_blank" role="link" class="aQy e aZr" href="https://docs.google.com/spreadsheets/d/1U8kXbtaQ8nV9O77itRojOI4hwz4AKwPAQ3kYFH5Di3M/pubchart?oid=1072376301&amp;format=interactive&amp;usp=gmail" data-tooltip-align="t,c" data-tooltip-class="a1V" tabindex="0"><span class="a3I" id=":z5">Preview attachment Support Numbers</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":yy" src="https://lh6.google.com/IK2P9aFJfvmo8jV2iUyRTuH3F7VCQ9gpYS0qafp-CeAdwUCc8Cf1hzHU34emBrSf64sjFeF8AIkfNfUU3LibBvMK7ZUw8cKk=w180-h120-p"><div id=":z0" class="aYv" style="display: none;"><img class="aYw aZF" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":z4" class="aYy"><div class="aYA"><img id=":z2" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x16.png" title="Google Sheets"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":z1">Support Numbers</span></div><div class="aYp"><span id=":z3" class="SaH2Ve">Shared in Drive</span></div></div></div></div></div><div class="aSI"><div id=":yz" class="aSJ" style="border-color: rgb(15, 157, 88);"></div></div></div></a><div class="aQw"><div id=":ud" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Download attachment Support Numbers" data-tooltip-class="a1V" aria-hidden="true" aria-disabled="true" data-tooltip="Download" style="-webkit-user-select: none; display: none;"><div class="aSK J-J5-Ji aYr"></div></div><div id=":uo" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" tabindex="0" aria-label="Save attachment to Drive Support Numbers" data-tooltip-class="a1V" data-tooltip="Save to Drive" style="-webkit-user-select: none;"><div class="wtScjd J-J5-Ji aYr aQu"><div class="T-aT4" style="display: none;"><div></div><div class="T-aT4-JX"></div></div></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('DRIVE');
    });
    it('Image', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo a5r N5jrZb" download_url="image/png:mixpanel.png:https://doc-0g-6g-docs.googleusercontent.com/docs/securesc/g7b6blm5q562d5kkm7hp3qjc197l3udo/rc9g7rutikab2k4o0grt0gojn77rhmre/1430503200000/12319357422283078493/14790627230404242429/0B9JouKBNdHWDeFpkM2QyWnFSdEU?h=07421357558349907965&amp;e=download" draggable="true"><a id=":vl" target="_blank" role="link" class="aQy aZr e aZI" href="https://doc-0g-6g-docs.googleusercontent.com/docs/securesc/g7b6blm5q562d5kkm7hp3qjc197l3udo/rc9g7rutikab2k4o0grt0gojn77rhmre/1430503200000/12319357422283078493/14790627230404242429/0B9JouKBNdHWDeFpkM2QyWnFSdEU?h=07421357558349907965&amp;e=download" data-tooltip-align="t,c" data-tooltip-class="a1V" tabindex="0"><span class="a3I" id=":2g">Preview attachment mixpanel.png</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG aYB" id=":vk" src="https://lh5.googleusercontent.com/2jWGyM4qIQPeyzEwnImuERZOVS53VACIv6znF6nKfJvM8_MEZvubnxicxUV4NXZtJ3Jxhw=w180-h120-p" style="margin: auto; position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; max-width: 100%; max-height: 100%;"><div id=":vi" class="aYv" style="display: none;"><img class="aYw aZy" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":2f" class="aYy"><div class="aYA"><img id=":6p" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x16.png" title="Image"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":71">mixpanel.png</span></div><div class="aYp"><span id=":2e" class="SaH2Ve">Shared in Drive</span></div></div></div></div></div><div class="aSI"><div id=":vj" class="aSJ" style="border-color: rgb(255, 255, 255);"></div></div></div></a><div class="aQw"><div id=":2j" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" aria-label="Download attachment mixpanel.png" data-tooltip-class="a1V" aria-hidden="false" aria-disabled="false" tabindex="0" data-tooltip="Download" style="-webkit-user-select: none;"><div class="aSK J-J5-Ji aYr"></div></div><div id=":2k" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" tabindex="0" aria-label="Locate attachment in Drive mixpanel.png" data-tooltip-class="a1V" data-tooltip="Show in Drive" style="-webkit-user-select: none;"><div class="wtScjd J-J5-Ji aYr aUR"><div class="T-aT4" style="display: none;"><div></div><div class="T-aT4-JX"></div></div></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('DRIVE');
    });
    it('Video', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo a5r N5jrZb" download_url="video/quicktime:Cannot%20Uncheck%20%22Restrict%20Sharing%22.mov:https://doc-0g-c4-docs.googleusercontent.com/docs/securesc/g7b6blm5q562d5kkm7hp3qjc197l3udo/l2883n65nr5vlmps3fkqqggs7prht2fo/1430503200000/14790627230404242429/14790627230404242429/0B8oWVm_LzypkWTBJN3BkRjNsdlVFVzNOeEk2U3AxN0hiOVYw?h=07421357558349907965&amp;e=download" draggable="true"><a id=":3e" target="_blank" role="link" class="aQy aZL aZr e aZI" href="https://doc-0g-c4-docs.googleusercontent.com/docs/securesc/g7b6blm5q562d5kkm7hp3qjc197l3udo/l2883n65nr5vlmps3fkqqggs7prht2fo/1430503200000/14790627230404242429/14790627230404242429/0B8oWVm_LzypkWTBJN3BkRjNsdlVFVzNOeEk2U3AxN0hiOVYw?h=07421357558349907965&amp;e=download" data-tooltip-align="t,c" data-tooltip-class="a1V" tabindex="0"><span class="a3I" id=":3m">Preview attachment Cannot Uncheck "Restrict Sharing".mov</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG aYB" id=":3f" src="https://lh4.googleusercontent.com/FMC3IHFmtQMWK4Hc-5ue5865HR7tvqTsX4yBwPdBd4mC5M9CCeZ_HE_bqnaPFPXpHlFO6rm3GdnXX2OLQITRdZ3CXMM=w180-h120-p" style="margin: auto; position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; max-width: 100%; max-height: 100%;"><div id=":3h" class="aYv" style="display: none;"><img class="aYw aZA" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":3l" class="aYy"><div class="aYA"><img id=":3j" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_video_x16.png" title="Video"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":3i">Cannot Uncheck "Restrict Sharing".mov</span></div><div class="aYp"><span id=":3k" class="SaH2Ve">Shared in Drive</span></div></div></div></div></div><div class="aSI"><div id=":3g" class="aSJ" style="border-color: rgb(219, 58, 55);"></div></div></div></a><div class="aQw"><div id=":3p" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" aria-label="Download attachment Cannot Uncheck &quot;Restrict Sharing&quot;.mov" data-tooltip-class="a1V" aria-hidden="false" aria-disabled="false" tabindex="0" data-tooltip="Download" style="-webkit-user-select: none;"><div class="aSK J-J5-Ji aYr"></div></div><div id=":3q" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" tabindex="0" aria-label="Locate attachment in Drive Cannot Uncheck &quot;Restrict Sharing&quot;.mov" data-tooltip-class="a1V" data-tooltip="Show in Drive" style="-webkit-user-select: none;"><div class="wtScjd J-J5-Ji aYr aUR"><div class="T-aT4" style="display: none;"><div></div><div class="T-aT4-JX"></div></div></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('DRIVE');
    });
  });
  describe('UNKNOWN', () => {
    it('YouTube', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo"><a id=":1vm" target="_blank" role="link" class="aQy aZR e aZr" href="https://www.youtube.com/watch?v=XRYN2xt11Ek&amp;authuser=0" data-tooltip-align="t,c" data-tooltip-class="a1V" tabindex="0" data-tooltip="Netflix JavaScript Talks - Async JavaScript with Reactive Extensions"><span class="a3I" id=":1te">Preview YouTube video Netflix JavaScript Talks - Async JavaScript with Reactive Extensions</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG aYB" id=":1t7" src="https://i.ytimg.com/vi/XRYN2xt11Ek/mqdefault.jpg" style="position: absolute; margin: auto; top: -10%; right: -10%; bottom: -10%; left: -10%; max-width: 120%; min-width: 100%;"><div id=":1t9" class="aYv" style="display: none;"><img class="aYw" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":1td" class="aYy"><div class="aYA"><img id=":1tb" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_2_youtube_x16.png"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":1ta">Netflix JavaScript Talks - Async JavaScript with Reactive Extensions</span></div><div class="aYp"><span id=":1tc" class="SaH2Ve"></span></div></div><div class="a11"><img class="aZS" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div></div></div></div><div class="aSI"><div id=":1t8" class="aSJ" style="border-color: rgb(119, 119, 119);"></div></div></div></a></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('UNKNOWN');
    });
  });
  describe('FILE', () => {
    it('Image partial load', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo"><a id=":x1" target="_blank" role="link" class="aQy  e aZI" href="https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=fimg&amp;…yTm3Jys8&amp;sz=w1600&amp;ats=1430504364643&amp;rm=14d0c75c6145c8d4&amp;zw" data-tooltip-align="t,c" data-tooltip-class="a1V"><span class="a3I" id=":x9">Preview attachment shortcuts available.png</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":x2" src="?ui=2&amp;ik=1f119f7bbb&amp;view=fimg&amp;th=14d0c75c6145c8d4&amp;attid=0.1&amp;disp=thd&amp;realattid=f_i94qwb490&amp;attbid=ANGjdJ_jUb4hyszH7BYwFZCYh0dyb3mT--y5OlZLPHEnUJEz83h5iHUHr6JGjb57I8ckhCnGqk8az2YlDc_TLM3rivIfqzqmeEpCJtPc-c9DQuAclsN5JUb_Dww64Ck&amp;sz=w180-h120-p-nu&amp;ats=1430504364643&amp;rm=14d0c75c6145c8d4&amp;zw"><div id=":x4" class="aYv"><img class="aYw aZy" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":x8" class="aYy"><div class="aYA"><img id=":x6" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x16.png" title="Image"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":x5">shortcuts available.png</span></div><div class="aYp"><span id=":x7" class="SaH2Ve">160 KB</span></div></div></div></div></div><div class="aSI"><div id=":x3" class="aSJ" style="border-color: #fff"></div></div></div></a><div class="aQw"><div id=":xc" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Download attachment shortcuts available.png" data-tooltip-class="a1V" aria-disabled="true" data-tooltip="Scanning for viruses..." style="-webkit-user-select: none;"><div class="aSK J-J5-Ji aYr"></div></div><div id=":xd" class="T-I J-J5-Ji aQv T-I-ax7 L3" title="Save to Drive" role="button" aria-label="Save attachment to Drive shortcuts available.png" data-tooltip-class="a1V" aria-hidden="true" style="-webkit-user-select: none; display: none;"><div class="wtScjd aQu J-J5-Ji aYr"><div class="T-aT4"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":xe" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" data-tooltip="Add to contacts" style="-webkit-user-select: none; display: none;"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
    it('Image', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo N5jrZb" download_url="image/png:shortcuts%20available.png:https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=att&amp;th=14d0c75c6145c8d4&amp;attid=0.1&amp;disp=safe&amp;realattid=f_i94qwb490&amp;zw" draggable="true"><a id=":v2" target="_blank" role="link" class="aQy  e aZI" href="https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=fimg&amp;th=14d0c75c6145c8d4&amp;attid=0.1&amp;disp=inline&amp;realattid=f_i94qwb490&amp;safe=1&amp;attbid=ANGjdJ-ttSt_OR-q9LAkPanrUKU8Mv3yKZYPdcZ0NNywe1NE-bvNZ3L759WF6EIaRanB7Kj663CFt7PdiRCQ0Py2X45zpH9NcuuzbqZET0tAepRJYN6U6YkK5yIFdRA&amp;sz=w1600&amp;ats=1430504486875&amp;rm=14d0c75c6145c8d4&amp;zw" data-tooltip-align="t,c" data-tooltip-class="a1V"><span class="a3I" id=":va">Preview attachment shortcuts available.png</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":v3" src="?ui=2&amp;ik=1f119f7bbb&amp;view=fimg&amp;th=14d0c75c6145c8d4&amp;attid=0.1&amp;disp=thd&amp;realattid=f_i94qwb490&amp;attbid=ANGjdJ9UbCYIYp1Tj3tWYlhwkVV4Vj4ddGIaiNqQL9Dmvhtxr1Yiu7-xX9xMdYzQY4upkHklIipUnO_7H3Y561Plkj1pHnw5L-J-2B__YULYHGfYrt7Vu7m5EmSN2YE&amp;sz=w180-h120-p-nu&amp;ats=1430504486875&amp;rm=14d0c75c6145c8d4&amp;zw"><div id=":v5" class="aYv"><img class="aYw aZy" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":v9" class="aYy"><div class="aYA"><img id=":v7" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x16.png" title="Image"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":v6">shortcuts available.png</span></div><div class="aYp"><span id=":v8" class="SaH2Ve">160 KB</span></div></div></div></div></div><div class="aSI"><div id=":v4" class="aSJ" style="border-color: #fff"></div></div></div></a><div class="aQw"><div id=":vd" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" tabindex="0" aria-label="Download attachment shortcuts available.png" data-tooltip-class="a1V" data-tooltip="Download" style="-webkit-user-select: none;"><div class="aSK J-J5-Ji aYr"></div></div><div id=":ve" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" tabindex="0" aria-label="Save attachment to Drive shortcuts available.png" data-tooltip-class="a1V" data-tooltip="Save to Drive" style="-webkit-user-select: none;"><div class="wtScjd J-J5-Ji aYr aQu"><div class="T-aT4" style="display: none;"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":vf" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" data-tooltip="Add to contacts" style="-webkit-user-select: none; display: none;"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
    it('Image 2', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo N5jrZb a5r" download_url="image/png:glyphicons_154_more_windows%402x.png:https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=att&amp;th=14d10d2d2cac40be&amp;attid=0.1&amp;disp=safe&amp;realattid=f_i95yjsrs0&amp;zw" draggable="true"><a id=":1ub" target="_blank" role="link" class="aQy aZr e aZI" href="https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=att&amp;th=14d10d2d2cac40be&amp;attid=0.1&amp;disp=safe&amp;realattid=f_i95yjsrs0&amp;zw" data-tooltip-align="t,c" data-tooltip-class="a1V" tabindex="0"><span class="a3I" id=":1uj">Preview attachment glyphicons_154_more_windows@2x.png</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG aYB" id=":1uc" src="?ui=2&amp;ik=1f119f7bbb&amp;view=fimg&amp;th=14d10d2d2cac40be&amp;attid=0.1&amp;disp=thd&amp;realattid=f_i95yjsrs0&amp;attbid=ANGjdJ81k5MBG_KC-NgOU0uB2nPdvsE8TB5xXoMRjUW4rxM6p0GcrkGwC7dHUdCimgqqR4Ab0K98UYfXLTZg6VjqeKGKFWiWlzJ3BBW9Cvytlcc0jO1fK5OqkHY6n2o&amp;sz=w180-h120-p-nu&amp;ats=1430510538939&amp;rm=14d10d2d2cac40be&amp;zw" style="margin: auto; position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; max-width: 100%; max-height: 100%;"><div id=":1ue" class="aYv" style="display: none;"><img class="aYw aZy" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":1ui" class="aYy"><div class="aYA"><img id=":1ug" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x16.png" title="Image"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":1uf">glyphicons_154_more_windows@2x.png</span></div><div class="aYp"><span id=":1uh" class="SaH2Ve">1.5 KB</span></div></div></div></div></div><div class="aSI"><div id=":1ud" class="aSJ" style="border-color: rgb(255, 255, 255);"></div></div></div></a><div class="aQw"><div id=":1um" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" aria-label="Download attachment glyphicons_154_more_windows@2x.png" data-tooltip-class="a1V" aria-disabled="false" style="-webkit-user-select: none;" tabindex="0" data-tooltip="Download"><div class="aSK J-J5-Ji aYr"></div></div><div id=":1un" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" aria-label="Save attachment to Drive glyphicons_154_more_windows@2x.png" data-tooltip-class="a1V" aria-hidden="false" style="-webkit-user-select: none;" tabindex="0" data-tooltip="Save to Drive"><div class="wtScjd J-J5-Ji aYr aQu"><div class="T-aT4" style="display: none;"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":1uo" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" style="-webkit-user-select: none; display: none;" data-tooltip="Add to contacts"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
    it('Doc partial load', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo"><a id=":yc" target="_blank" role="link" class="aQy  e" href="https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=att&amp;th=14d10d6c7456d1bf&amp;attid=0.1&amp;disp=inline&amp;realattid=f_i95ypbc10&amp;safe=1&amp;zw" data-tooltip-align="t,c" data-tooltip-class="a1V"><span class="a3I" id=":2v">Preview attachment NOTES.txt</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":yb" style="display:none;"><div id=":10m" class="aYv"><img class="aYw aZG" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":3r" class="aYy"><div class="aYA"><img id=":10o" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_text_x16.png" title="Text"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":10n">NOTES.txt</span></div><div class="aYp"><span id=":33" class="SaH2Ve">1 KB</span></div></div></div></div></div><div class="aSI"><div id=":ya" class="aSJ" style="border-color: #4986e7"></div></div></div></a><div class="aQw"><div id=":3f" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Download attachment NOTES.txt" data-tooltip-class="a1V" aria-disabled="true" data-tooltip="Scanning for viruses..." style="-webkit-user-select: none;"><div class="aSK J-J5-Ji aYr"></div></div><div id=":3e" class="T-I J-J5-Ji aQv T-I-ax7 L3" title="Save to Drive" role="button" aria-label="Save attachment to Drive NOTES.txt" data-tooltip-class="a1V" aria-hidden="true" style="-webkit-user-select: none; display: none;"><div class="wtScjd aQu J-J5-Ji aYr"><div class="T-aT4"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":2d" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" data-tooltip="Add to contacts" style="-webkit-user-select: none; display: none;"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
    it('Doc', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo N5jrZb" download_url="text/plain:NOTES.txt:https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=att&amp;th=14d10d6c7456d1bf&amp;attid=0.1&amp;disp=safe&amp;realattid=f_i95ypbc10&amp;zw" draggable="true"><a id=":yc" target="_blank" role="link" class="aQy e" href="https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=att&amp;th=14d10d6c7456d1bf&amp;attid=0.1&amp;disp=safe&amp;realattid=f_i95ypbc10&amp;zw" data-tooltip-align="t,c" data-tooltip-class="a1V" tabindex="0"><span class="a3I" id=":2v">Preview attachment NOTES.txt</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":yb" style="display: none;"><div id=":10m" class="aYv"><img class="aYw aZG" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":3r" class="aYy"><div class="aYA"><img id=":10o" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_text_x16.png" title="Text"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":10n">NOTES.txt</span></div><div class="aYp"><span id=":33" class="SaH2Ve">1 KB</span></div></div></div></div></div><div class="aSI"><div id=":ya" class="aSJ" style="border-color: rgb(73, 134, 231);"></div></div></div></a><div class="aQw"><div id=":3f" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" aria-label="Download attachment NOTES.txt" data-tooltip-class="a1V" aria-disabled="false" style="-webkit-user-select: none;" tabindex="0" data-tooltip="Download"><div class="aSK J-J5-Ji aYr"></div></div><div id=":3e" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" aria-label="Save attachment to Drive NOTES.txt" data-tooltip-class="a1V" aria-hidden="false" style="-webkit-user-select: none;" tabindex="0" data-tooltip="Save to Drive"><div class="wtScjd J-J5-Ji aYr aQu"><div class="T-aT4" style="display: none;"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":2d" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" style="-webkit-user-select: none; display: none;" data-tooltip="Add to contacts"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
    it('Generic partial load', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo"><a id=":38" target="_blank" role="link" class="aQy  e" data-tooltip-align="t,c" data-tooltip-class="a1V"><span class="a3I" id=":ug">Preview attachment package.json</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":37" style="display:none;"><div id=":30" class="aYv"><img class="aYw" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":v0" class="aYy"><div class="aYA"><img id=":2y" class="aSM" src="https://drive-thirdparty.googleusercontent.com/16/type/application/json"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":2z">package.json</span></div><div class="aYp"><span id=":v2" class="SaH2Ve">1.7 KB</span></div></div></div></div></div><div class="aSI"><div id=":36" class="aSJ" style="border-color: #777"></div></div></div></a><div class="aQw"><div id=":ud" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Download attachment package.json" data-tooltip-class="a1V" aria-disabled="true" data-tooltip="Scanning for viruses..." style="-webkit-user-select: none;"><div class="aSK J-J5-Ji aYr"></div></div><div id=":uc" class="T-I J-J5-Ji aQv T-I-ax7 L3" title="Save to Drive" role="button" aria-label="Save attachment to Drive package.json" data-tooltip-class="a1V" aria-hidden="true" style="-webkit-user-select: none; display: none;"><div class="wtScjd aQu J-J5-Ji aYr"><div class="T-aT4"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":ub" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" data-tooltip="Add to contacts" style="-webkit-user-select: none; display: none;"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
    it('Generic', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo N5jrZb" download_url="application/json:package.json:https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=att&amp;th=14d10ce8187dd269&amp;attid=0.1&amp;disp=safe&amp;realattid=f_i95ydr8x0&amp;zw" draggable="true"><a id=":35" target="_blank" role="link" class="aQy e" data-tooltip-align="t,c" data-tooltip-class="a1V" tabindex="0"><span class="a3I" id=":wf">Preview attachment package.json</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":3t" style="display: none;"><div id=":wk" class="aYv"><img class="aYw" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":wg" class="aYy"><div class="aYA"><img id=":wi" class="aSM" src="https://drive-thirdparty.googleusercontent.com/16/type/application/json"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":wj">package.json</span></div><div class="aYp"><span id=":wh" class="SaH2Ve">1.7 KB</span></div></div></div></div></div><div class="aSI"><div id=":wl" class="aSJ" style="border-color: rgb(119, 119, 119);"></div></div></div></a><div class="aQw"><div id=":wc" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" aria-label="Download attachment package.json" data-tooltip-class="a1V" aria-disabled="false" style="-webkit-user-select: none;" tabindex="0" data-tooltip="Download"><div class="aSK J-J5-Ji aYr"></div></div><div id=":wb" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" aria-label="Save attachment to Drive package.json" data-tooltip-class="a1V" aria-hidden="false" style="-webkit-user-select: none;" tabindex="0" data-tooltip="Save to Drive"><div class="wtScjd J-J5-Ji aYr aQu"><div class="T-aT4" style="display: none;"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":wa" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" style="-webkit-user-select: none; display: none;" data-tooltip="Add to contacts"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
    it('Video partial load', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo"><a id=":wt" target="_blank" role="link" class="aQy  e aZI aZL" data-tooltip-align="t,c" data-tooltip-class="a1V"><span class="a3I" id=":2s">Preview attachment assigned to indicators.mov</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":ws" style="display:none;"><div id=":wq" class="aYv"><img class="aYw aZA" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":12v" class="aYy"><div class="aYA"><img id=":12u" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_video_x16.png" title="Video"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":3g">assigned to indicators.mov</span></div><div class="aYp"><span id=":zc" class="SaH2Ve">2.9 MB</span></div></div></div></div></div><div class="aSI"><div id=":wr" class="aSJ" style="border-color: #db3a37"></div></div></div></a><div class="aQw"><div id=":ym" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Download attachment assigned to indicators.mov" data-tooltip-class="a1V" aria-disabled="true" data-tooltip="Scanning for viruses..." style="-webkit-user-select: none;"><div class="aSK J-J5-Ji aYr"></div></div><div id=":6k" class="T-I J-J5-Ji aQv T-I-ax7 L3" title="Save to Drive" role="button" aria-label="Save attachment to Drive assigned to indicators.mov" data-tooltip-class="a1V" aria-hidden="true" style="-webkit-user-select: none; display: none;"><div class="wtScjd aQu J-J5-Ji aYr"><div class="T-aT4"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":w0" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" data-tooltip="Add to contacts" style="-webkit-user-select: none; display: none;"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
    it('Video', () => {
      const parent = document.createElement('div');
      parent.innerHTML =
        '<span class="aZo N5jrZb a5r" download_url="video/quicktime:assigned%20to%20indicators.mov:https://mail.google.com/mail/u/0/?ui=2&amp;ik=1f119f7bbb&amp;view=att&amp;th=14d11050c673e1b5&amp;attid=0.1&amp;disp=safe&amp;realattid=f_i960ian10&amp;zw" draggable="true"><a id=":3i" target="_blank" role="link" class="aQy aZL e" data-tooltip-align="t,c" data-tooltip-class="a1V" tabindex="0"><span class="a3I" id=":3q">Preview attachment assigned to indicators.mov</span><div aria-hidden="true"><div class="aSG"></div><div class="aVY aZn"><div class="aZm"></div></div><div class="aSH"><img class="aQG" id=":3j" style="display: none;"><div id=":3l" class="aYv"><img class="aYw aZA" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div><div id=":3p" class="aYy"><div class="aYA"><img id=":3n" class="aSM" src="//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_video_x16.png" title="Video"></div><div class="aYz"><div class="a12"><div class="aQA"><span class="aV3 a6U" id=":3m">assigned to indicators.mov</span></div><div class="aYp"><span id=":3o" class="SaH2Ve">2.9 MB</span></div></div></div></div></div><div class="aSI"><div id=":3k" class="aSJ" style="border-color: rgb(219, 58, 55);"></div></div></div></a><div class="aQw"><div id=":3t" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" tabindex="0" aria-label="Download attachment assigned to indicators.mov" data-tooltip-class="a1V" style="-webkit-user-select: none;" data-tooltip="Download"><div class="aSK J-J5-Ji aYr"></div></div><div id=":3u" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" tabindex="0" aria-label="Save attachment to Drive assigned to indicators.mov" data-tooltip-class="a1V" style="-webkit-user-select: none;" data-tooltip="Save to Drive"><div class="wtScjd J-J5-Ji aYr aQu"><div class="T-aT4" style="display: none;"><div></div><div class="T-aT4-JX"></div></div></div></div><div id=":3v" class="T-I J-J5-Ji aQv T-I-ax7 L3 T-I-JE aVZ" role="button" aria-label="Add to contacts" data-tooltip-class="a1V" aria-disabled="true" aria-hidden="true" style="-webkit-user-select: none; display: none;" data-tooltip="Add to contacts"><div class="aVX J-J5-Ji aYr"></div></div></div></span>';
      const item = parent.firstElementChild;
      const card = new GmailAttachmentCardView(
        {
          element: item,
        },
        driver,
      );
      expect(card.getAttachmentType()).toBe('FILE');
    });
  });
});
