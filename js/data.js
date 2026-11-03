/**
 * DUAYERİ FINDIK — Merkezi Veri & Admin Senkronizasyon Katmanı
 * Ordu / Fatsa / Duayeri Köyü Üreticiden Tüketiciye Fındık Satış Platformu
 *
 * Admin panelinden yapılan tüm değişiklikler (Randıman, Hasat Yılı, Köy/İlçe,
 * Kırım/Paketleme Tarihi, Fiyat, Stok, Fotoğraf/Video Galeri, İletişim, IBAN ve Pixel ID'leri)
 * localStorage + opsiyonel Firebase senkronizasyonu ile tüm sayfalara anında yansır.
 */

const DEFAULT_SITE_DATA = {
  settings: {
    siteName: "Duayeri Fındık",
    slogan: "Ordu Fatsa Duayeri Köyü'nden Sofranıza — Doğal, Taze, Aracısız Fındık",
    phone: "+90 532 000 52 52",
    whatsapp: "905320005252",
    email: "siparis@duayerifindik.com",
    address: "Duayeri Mahallesi Gençoğlu Sokak No:7 ORDU/FATSA",
    mapsCoords: "40.9850, 37.4850",
    mapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Duayeri,Fatsa,Ordu",
    mapsEmbedUrl: "https://maps.google.com/maps?q=Duayeri%20Fatsa%20Ordu&t=&z=13&ie=UTF8&iwloc=&output=embed",
    bankName: "Ziraat Bankası — Fatsa Şubesi",
    ibanHolder: "Duayeri Fındık Üretici Ailesi",
    ibanNumber: "TR00 0001 0000 0000 0000 0052 52",
    freeShippingNote: "Yurtiçi Kargo, Aras Kargo ve MNG Kargo ile Türkiye geneli indirimli/anlaşmalı gönderim.",
    adventureBgImage: "görsel/hazelnut.jpeg",
    heroTitle: "Duayeri Köyü'nden Sofranıza Doğal Kabuklu Fındık",
    heroSubtitle: "Aracı yok, tüccar komisyonu yok! Kendi bahçemizden özenle topladığımız doğal, güneşte kurutulmuş taze mahsul fındığımızı doğrudan kapınıza gönderiyoruz.",
    // Reklam & Analitik ID'leri (Admin panelinden güncellenebilir)
    ga4Id: "G-DUAYERI52",
    gtmId: "GTM-DUAYERI",
    googleAdsId: "AW-DUAYERI52",
    googleAdsWhatsappLabel: "WA_PRIMARY_CONV",
    googleAdsLeadLabel: "FORM_PRIMARY_CONV",
    metaPixelId: "META_PIXEL_52",
    tiktokPixelId: "TIKTOK_PIXEL_52"
  },

  products: [
    {
      id: "paket-5kg",
      name: "Kabuklu Fındık — 5 KG",
      category: "5kg",
      weightLabel: "5 KG",
      badge: "Bireysel Paket",
      price: 850,
      priceText: "₺850",
      unitText: "5 KG Özel Bez/File Çuval",
      image: "image/ürün_foto/indir (28).jpeg",
      description: "Ev tüketimi için ideal, özenle seçilmiş iri taneli doğal Fatsa kabuklu fındığı.",
      // 🏷️ Admin Panelinden Kontrol Edilen Paket Künye Bilgileri
      randiman: "%53+ Yüksek Randıman",
      harvestYear: "2026 Yeni Mahsul",
      originLocation: "Duayeri Köyü / Fatsa / Ordu",
      packagingDate: "Sipariş Günü Taze Çuvallama",
      inStock: true,
      stockCount: 120,
      isWholesale: false
    },
    {
      id: "paket-10kg",
      name: "Kabuklu Fındık — 10 KG",
      category: "10kg",
      weightLabel: "10 KG",
      badge: "En Çok Tercih Edilen",
      price: 1650,
      priceText: "₺1.650",
      unitText: "10 KG Dayanıklı Jüt/File Çuval",
      image: "image/ürün_foto/indir (27).jpeg",
      description: "Aile boyu avantajlı paket. Güneşte doğal harman kurutması, çifte kavrulmaya ve kırıma uygun.",
      randiman: "%53 - %54 Yüksek Randıman",
      harvestYear: "2026 Yeni Mahsul",
      originLocation: "Duayeri Köyü / Fatsa / Ordu",
      packagingDate: "Sipariş Günü Taze Çuvallama",
      inStock: true,
      stockCount: 85,
      isWholesale: false
    },
    {
      id: "paket-20kg",
      name: "Kabuklu Fındık — 20+ KG",
      category: "20kg",
      weightLabel: "20+ KG",
      badge: "Avantajlı Toplu Alım",
      price: 3200,
      priceText: "₺3.200",
      unitText: "20 KG Özel Üretici Çuvalı (KG: ₺160)",
      image: "image/hero-bg.jpg.jpeg",
      description: "Kışlık stok yapmak isteyen aileler ve butik işletmeler için üretici fiyatıyla 20 KG ve üzeri paket.",
      randiman: "%54+ Seçme Randıman",
      harvestYear: "2026 Yeni Mahsul",
      originLocation: "Duayeri Köyü / Fatsa / Ordu",
      packagingDate: "Sipariş Günü Taze Çuvallama",
      inStock: true,
      stockCount: 50,
      isWholesale: false
    },
    {
      id: "paket-tonaj",
      name: "Tonaj Satış (Toptan Çuval)",
      category: "toptan",
      weightLabel: "100 KG — 10+ Ton",
      badge: "Toptan / Tonaj",
      price: 0,
      priceText: "Teklif Alın",
      unitText: "50 KG'lık Jüt Çuvallarda Tonajlı Sevkiyat",
      image: "image/ürün_foto/indir (27).jpeg",
      description: "Kuruyemişçiler, pastaneler, kırım fabrikaları ve toptancılar için doğrudan Duayeri Köyü üreticisinden tonajlı fındık.",
      randiman: "%52 - %55 Ekspertiz Garantili",
      harvestYear: "2026 Yeni Mahsul",
      originLocation: "Duayeri Köyü / Fatsa / Ordu",
      packagingDate: "Sevkiyat Günü Kantar & Çuvallama",
      inStock: true,
      stockCount: 5000,
      isWholesale: true
    }
  ],

  gallery: [
    {
      id: "gal-1",
      type: "image",
      category: "Bahçe",
      title: "Duayeri Köyü Fındık Bahçemiz",
      description: "Ordu Fatsa Duayeri Köyü'ndeki asırlık fındık ocaklarımızda hiçbir kimyasal kalıntı olmadan doğal üretim.",
      url: "image/ürün_foto/Fındık.jpeg"
    },
    {
      id: "gal-2",
      type: "image",
      category: "Hasat & Harman",
      title: "Geleneksel Harman ve Güneşte Kurutma",
      description: "Dalından özenle toplanan fındıklarımız patoz sonrası Karadeniz güneşinde ideal nem oranına kadar kurutulur.",
      url: "image/ürün_foto/indir (27).jpeg"
    },
    {
      id: "gal-3",
      type: "image",
      category: "Paketleme",
      title: "Sipariş Günü Taze Paketleme",
      description: "Çürük ve boş tanelerden el emeğiyle ayıklanan yüksek randımanlı fındıklarımız çuvallanarak kargoya hazırlanır.",
      url: "image/ürün_foto/indir (28).jpeg"
    },
    {
      id: "gal-4",
      type: "video",
      category: "Video Serüven",
      title: "Duayeri Köyü Hasat & Fındık Serüvenimiz (Video)",
      description: "Bahçeden sofranıza uzanan doğal fındık yolculuğumuzu izleyin.",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "image/hero-bg.jpg.jpeg"
    }
  ],

  orders: [
    {
      orderNo: "DF-2026-1042",
      customerName: "Ahmet Yılmaz",
      phone: "0533 111 22 33",
      city: "İstanbul / Kadıköy",
      packageId: "paket-10kg",
      packageName: "Kabuklu Fındık — 10 KG",
      quantity: 1,
      totalText: "₺1.650",
      cargoCompany: "Yurtiçi Kargo",
      trackingCode: "YK9088776655",
      status: "Kargoya Verildi",
      utmSource: "google_ads",
      createdAt: "2026-11-02 14:20"
    },
    {
      orderNo: "DF-2026-1048",
      customerName: "Zeynep Kaya",
      phone: "0542 999 88 77",
      city: "Ankara / Çankaya",
      packageId: "paket-20kg",
      packageName: "Kabuklu Fındık — 20+ KG",
      quantity: 1,
      totalText: "₺3.200",
      cargoCompany: "Aras Kargo",
      trackingCode: "",
      status: "Havale Onayı Bekleniyor",
      utmSource: "instagram_ads",
      createdAt: "2026-11-03 11:05"
    }
  ]
};

const STORAGE_KEY = "DUAYERI_FINDIK_DB_V2";

const SiteData = {
  getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SITE_DATA));
        return JSON.parse(JSON.stringify(DEFAULT_SITE_DATA));
      }
      const parsed = JSON.parse(raw);
      const mergedSettings = { ...DEFAULT_SITE_DATA.settings, ...(parsed.settings || {}) };
      if (mergedSettings.heroTitle && mergedSettings.heroTitle.startsWith("Ordu Fatsa")) {
        mergedSettings.heroTitle = DEFAULT_SITE_DATA.settings.heroTitle;
      }
      if (mergedSettings.heroSubtitle && !mergedSettings.heroSubtitle.includes("topladığımız doğal")) {
        mergedSettings.heroSubtitle = DEFAULT_SITE_DATA.settings.heroSubtitle;
      }
      if (mergedSettings.address && mergedSettings.address.includes("Küme Evleri")) {
        mergedSettings.address = DEFAULT_SITE_DATA.settings.address;
      }
      return {
        settings: mergedSettings,
        products: Array.isArray(parsed.products) && parsed.products.length ? parsed.products : DEFAULT_SITE_DATA.products,
        gallery: Array.isArray(parsed.gallery) && parsed.gallery.length ? parsed.gallery : DEFAULT_SITE_DATA.gallery,
        orders: Array.isArray(parsed.orders) ? parsed.orders : DEFAULT_SITE_DATA.orders
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_SITE_DATA));
    }
  },

  saveData(newData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SITE_DATA));
    return this.getData();
  },

  addOrder(orderObj) {
    const data = this.getData();
    data.orders.unshift(orderObj);
    this.saveData(data);
    return orderObj;
  },

  findOrder(query) {
    const data = this.getData();
    const q = (query || "").trim().toLowerCase();
    return data.orders.filter(
      o =>
        o.orderNo.toLowerCase().includes(q) ||
        o.phone.replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q))
    );
  }
};

window.SiteData = SiteData;
