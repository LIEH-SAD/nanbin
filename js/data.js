/* ============================================================
   Nanbin Studio - Content data config
   Text fields hold i18n ids; translations live in /language/*.json.
   Edit this file to update images, links and structure.
   ============================================================ */

'use strict';

const SITE_DATA = {
  /* ---- Hero carousel ---- */
  carousel: [
    {
      badge: 'hero.s1.badge',
      title: 'hero.s1.title',       // allows inline markup (rendered as HTML)
      desc: 'hero.s1.desc',
      btnText: 'hero.s1.btn1',
      btnLink: 'https://modrinth.com/mod/nanbin-create-mod',
      btn2Text: 'hero.s1.btn2',
      btn2Link: 'https://github.com/LIEH-SAD/Nanbin-Create-Mod',
      image: 'https://free.picui.cn/free/2026/07/08/6a4d9fae0cf19.png'
    },
    {
      badge: 'hero.s2.badge',
      title: 'hero.s2.title',
      desc: 'hero.s2.desc',
      btnText: 'hero.s2.btn1',
      btnLink: 'https://modrinth.com/mod/verdant-harvest',
      btn2Text: 'hero.s2.btn2',
      btn2Link: 'https://github.com/LIEH-SAD/Verdant-Harvest',
      image: 'https://free.picui.cn/free/2026/07/05/6a49c6ea50476.png'
    },
    {
      badge: 'hero.s3.badge',
      title: 'hero.s3.title',
      desc: 'hero.s3.desc',
      btnText: 'hero.s3.btn1',
      btnLink: 'https://1827870760.share.123pan.cn/123pan/PKCujv-cue4h',
      btn2Text: 'hero.s3.btn2',
      btn2Link: 'https://afdian.com/a/sadliehbilibili',
      image: 'https://free.picui.cn/free/2026/07/08/6a4da2b66ac38.png'
    }
  ],

  /* ---- Showcase ---- */
  showcases: [
    {/*
      image: 'https://picsum.photos/seed/techvision/600/400',
      title: 'showcase.item1.title',
      desc: 'showcase.item1.desc',
      tags: ['showcase.item1.tag1'],
      link: 'https://example.com/techvision'
    */},
  ],

  /* ---- Footer ---- */
  footer: {
    desc: 'footer.desc',
    cols: [
      {
        title: 'footer.col.about',
        links: [
          { text: 'footer.about.intro', href: '#' },
          { text: 'footer.about.join', href: '#' },
          { text: 'footer.about.news', href: '#' },
          { text: 'footer.about.privacy', href: '#' }
        ]
      },
      {
        title: 'footer.col.contact',
        links: [
          { text: 'sadlieh@hotmail.com', href: '#' }
        ]
      }
    ],
  }
};
