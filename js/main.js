/**
 * DUAYERİ FINDIK — Ana JavaScript (UI, Ürün Künyesi Render, Filtreleme, Galeri & Sipariş Akışı)
 */

const DuayeriApp = {
  init() {
    this.normalizePageScale();
    this.setupMobileMenu();
    this.setupSecretAdminAccess();
    this.setupPhoneInputs();
    this.applyDynamicSettings();
    this.renderProductsGrid("all");
    this.setupFilterTabs();
    this.renderGalleryMedia();
    this.setupOrderPage();
    this.setupCargoTrackingPage();
    this.setupContactPage();
  },

  // 📞 Telefon inputlarında "05" sabit başlangıç ve sadece 2+9 = 11 rakam kuralı
  setupPhoneInputs() {
    const phoneInputs = document.querySelectorAll('input[type="tel"], #custPhone, #contactPhone');
    phoneInputs.forEach(input => {
      const enforceFormat = () => {
        let digits = input.value.replace(/\D/g, "");
        if (digits.startsWith("905")) {
          digits = digits.slice(1);
        }
        let rest = "";
        if (digits.startsWith("05")) {
          rest = digits.slice(2);
        } else if (digits.startsWith("0")) {
          rest = digits.slice(1);
        } else if (digits.startsWith("5")) {
          rest = digits.slice(1);
        } else {
          rest = digits;
        }
        input.value = "05" + rest.slice(0, 9);
      };

      enforceFormat();

      input.addEventListener("focus", () => {
        enforceFormat();
        setTimeout(() => {
          if ((input.selectionStart || 0) < 2) {
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }, 0);
      });

      input.addEventListener("click", () => {
        if ((input.selectionStart || 0) < 2) {
          input.setSelectionRange(2, Math.max(2, input.selectionEnd || 2));
        }
      });

      input.addEventListener("keydown", e => {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;

        // "05" sabit kısmının silinmesini engelle
        if ((e.key === "Backspace" && start <= 2 && end <= 2) || (e.key === "Delete" && start < 2)) {
          e.preventDefault();
          input.setSelectionRange(2, 2);
          return;
        }

        // Kontrol tuşlarına izin ver
        if (
          e.ctrlKey ||
          e.metaKey ||
          ["Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
        ) {
          return;
        }

        // Sadece rakamlara (0-9) izin ver
        if (!/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          return;
        }

        // Toplam 11 haneye ulaşıldıysa ve metin seçili değilse yeni rakamı engelle
        if (input.value.length >= 11 && start === end) {
          e.preventDefault();
        }
      });

      input.addEventListener("input", () => {
        enforceFormat();
      });
    });
  },

  // 🔐 Footer'daki logoya çift tıklandığında Admin Paneline geçiş
  setupSecretAdminAccess() {
    document.querySelectorAll(".footer-logo-seal").forEach(seal => {
      let lastClickTime = 0;

      seal.addEventListener("click", e => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastClickTime < 450) {
          window.location.href = "admin/index.html";
        }
        lastClickTime = now;
      });

      seal.addEventListener("dblclick", e => {
        e.preventDefault();
        window.location.href = "admin/index.html";
      });
    });
  },

  // 🔍 Tüm HTML sayfalarını sabit %67 (0.67) elit ölçek oranında eşitleyen mekanizma
  normalizePageScale() {
    const TARGET_ZOOM = 0.67;

    const syncScale = () => {
      try {
        if (window.innerWidth <= 768) {
          document.documentElement.style.zoom = "1";
          return;
        }

        const path = window.location.pathname.toLowerCase();
        const currentDpr = window.devicePixelRatio || 1;

        // Ana sayfa veya ürünler sayfasındaki tarayıcı DPR'sini baz al
        if (path.endsWith("index.html") || path.endsWith("urunler.html") || path.endsWith("/")) {
          localStorage.setItem("DUAYERI_BASE_DPR", String(currentDpr));
        }

        const baseDpr = parseFloat(localStorage.getItem("DUAYERI_BASE_DPR") || String(currentDpr));
        // Eğer bir sekmede tarayıcı zoom'u zaten değiştirilmişse, onu da hesaba katarak net %67 ölçeğe sabitle
        const effectiveZoom = (TARGET_ZOOM * baseDpr) / currentDpr;
        document.documentElement.style.zoom = effectiveZoom.toFixed(4);
      } catch (e) {
        document.documentElement.style.zoom = String(TARGET_ZOOM);
      }
    };

    syncScale();
    window.addEventListener("resize", syncScale);
  },

  setupMobileMenu() {
    const toggleBtn = document.getElementById("mobileMenuToggle");
    const mobileNav = document.getElementById("mobileNav");
    if (toggleBtn && mobileNav) {
      toggleBtn.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
      });
    }
  },

  applyDynamicSettings() {
    if (!window.SiteData) return;
    const { settings } = window.SiteData.getData();

    // Hero metinleri (Admin panelinden düzenlenmişse güncellenir)
    const heroTitleEl = document.getElementById("dynamicHeroTitle");
    const heroSubEl = document.getElementById("dynamicHeroSubtitle");
    if (heroTitleEl && settings.heroTitle) heroTitleEl.textContent = settings.heroTitle;
    if (heroSubEl && settings.heroSubtitle) heroSubEl.textContent = settings.heroSubtitle;

    // Yüzen WhatsApp & diğer WhatsApp linklerini güncelle (Orijinal Resmi WhatsApp Vektör İkonu)
    const cleanWa = (settings.whatsapp || "905320005252").replace(/\D/g, "");
    const fullWaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true"><path fill="#FFFFFF" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;
    document.querySelectorAll(".floating-whatsapp").forEach(btn => {
      btn.innerHTML = fullWaSvg;
    });
    document.querySelectorAll(".js-whatsapp-link").forEach(link => {
      const customMsg =
        link.getAttribute("data-wa-text") ||
        "Merhaba, Ordu Fatsa Duayeri Köyü doğal kabuklu fındık paketleriniz hakkında bilgi ve sipariş vermek istiyorum.";
      link.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(customMsg)}`;
    });

    // Telefon ve adres alanları
    document.querySelectorAll(".js-site-phone").forEach(el => {
      el.textContent = settings.phone;
      if (el.tagName === "A") {
        el.href = `tel:${settings.phone.replace(/\s+/g, "")}`;
      }
    });

    document.querySelectorAll(".js-site-address").forEach(el => {
      el.textContent = settings.address;
    });

    document.querySelectorAll(".js-site-email").forEach(el => {
      el.textContent = settings.email;
      if (el.tagName === "A") el.href = `mailto:${settings.email}`;
    });

    // Serüven banner arka planı
    const advBanner = document.getElementById("adventureBannerBox");
    if (advBanner && settings.adventureBgImage) {
      advBanner.style.backgroundImage = `url('${settings.adventureBgImage}')`;
    }
  },

  // 🌰 Ürün Grid'i ve Zorunlu Paket Künyesi (Randıman, Hasat Yılı, Köy/İlçe, Kırım/Paketleme Tarihi)
  renderProductsGrid(filterCategory = "all") {
    const container = document.getElementById("productsGridContainer");
    if (!container || !window.SiteData) return;

    const { products, settings } = window.SiteData.getData();
    const cleanWa = (settings.whatsapp || "905320005252").replace(/\D/g, "");

    const filtered =
      filterCategory === "all"
        ? products
        : products.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());

    container.innerHTML = filtered
      .map(product => {
        const isWholesale = product.isWholesale || product.category === "toptan";
        const actionUrl = isWholesale
          ? `siparis.html?paket=${encodeURIComponent(product.id)}&tip=tonaj`
          : `siparis.html?paket=${encodeURIComponent(product.id)}`;

        const waDirectMsg = isWholesale
          ? `Merhaba, Duayeri Köyü toptan/tonajlı (${product.weightLabel}) kabuklu fındık için fiyat teklifi almak istiyorum.`
          : `Merhaba, ${product.name} (${product.priceText}) sipariş vermek istiyorum.`;

        return `
        <article class="product-card" data-category="${product.category}">
          <div class="product-card-top">
            <div class="product-img-box">
              <span class="product-badge">${product.badge || product.weightLabel}</span>
              <span class="product-randiman-badge">⚖️ ${product.randiman}</span>
              <img src="${product.image}" alt="${product.name} - ${product.originLocation}" loading="lazy">
            </div>

            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
          </div>

          <div class="product-card-bottom">
            <!-- 🏷️ ZORUNLU PAKET TAZELİK & MENŞEİ KÜNYESİ (Admin Kontrollü) -->
            <div class="product-kunye-box" aria-label="Ürün Künye Bilgileri">
              <div class="kunye-row">
                <span class="kunye-label">⚖️ Randıman:</span>
                <span class="kunye-val">${product.randiman}</span>
              </div>
              <div class="kunye-row">
                <span class="kunye-label">📅 Hasat Yılı:</span>
                <span class="kunye-val">${product.harvestYear}</span>
              </div>
              <div class="kunye-row">
                <span class="kunye-label">📍 Köy / İlçe:</span>
                <span class="kunye-val">${product.originLocation}</span>
              </div>
              <div class="kunye-row">
                <span class="kunye-label">📦 Kırım/Paketleme:</span>
                <span class="kunye-val">${product.packagingDate}</span>
              </div>
            </div>

            <div class="product-footer">
              <div class="product-price-wrap">
                <span class="price-amount">${product.priceText}</span>
                <span class="price-unit">${product.unitText || ""}</span>
              </div>
              <a href="https://wa.me/${cleanWa}?text=${encodeURIComponent(waDirectMsg)}"
                 target="_blank"
                 rel="noopener"
                 class="product-order-btn"
                 data-track-whatsapp="product_card_order_btn"
                 data-product="${product.name}">
                 Sipariş Ver
              </a>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  },

  setupFilterTabs() {
    const tabs = document.querySelectorAll(".filter-tab-btn");
    if (!tabs.length) return;

    tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        const filterVal = btn.getAttribute("data-filter") || "all";
        this.renderProductsGrid(filterVal);

        if (window.DuayeriTracker) {
          window.DuayeriTracker.pushEvent("filter_click", { selected_filter: filterVal });
        }
      });
    });
  },

  // 📸 Fotoğraf & Video Serüven Galerisi Render (Fındık Serüvenimiz Sayfası)
  renderGalleryMedia() {
    const container = document.getElementById("galleryMediaContainer");
    if (!container || !window.SiteData) return;

    const { gallery } = window.SiteData.getData();
    container.innerHTML = gallery
      .map(item => {
        if (item.type === "video") {
          const isLocalVideo = /\.(mp4|webm|ogg)$/i.test(item.url || "");
          const thumbImg = item.thumbnail || "image/hero-bg.jpg.jpeg";
          return `
          <div class="media-card">
            ${
              isLocalVideo
                ? `<video src="${item.url}" poster="${thumbImg}" controls preload="metadata" style="width:100%; height:240px; object-fit:cover; background:#000;"></video>`
                : `<a href="${item.url.replace('/embed/', '/watch?v=')}" target="_blank" rel="noopener" style="position:relative; display:block; height:240px; overflow:hidden; background:#111;">
                    <img src="${thumbImg}" alt="${item.title}" style="width:100%; height:100%; object-fit:cover; opacity:0.82;">
                    <span style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
                      <span style="width:60px; height:60px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.4rem; box-shadow:0 8px 24px rgba(0,0,0,0.4);">▶</span>
                    </span>
                  </a>`
            }
            <div class="media-card-body">
              <span>🎥 ${item.category}</span>
              <h4>${item.title}</h4>
              <p style="font-size:0.86rem; color:var(--text-muted); margin-top:0.35rem;">${item.description || ""}</p>
            </div>
          </div>
        `;
        }
        return `
        <div class="media-card">
          <img src="${item.url}" alt="${item.title} - Ordu Fatsa Duayeri Köyü" loading="lazy">
          <div class="media-card-body">
            <span>📸 ${item.category}</span>
            <h4>${item.title}</h4>
            <p style="font-size:0.86rem; color:var(--text-muted); margin-top:0.35rem;">${item.description || ""}</p>
          </div>
        </div>
      `;
      })
      .join("");
  },

  // 🛒 Sipariş Sayfası (Havale/EFT + Tonaj + Primary Lead Conversion)
  setupOrderPage() {
    const orderForm = document.getElementById("duayeriOrderForm");
    if (!orderForm || !window.SiteData) return;

    const { products, settings } = window.SiteData.getData();
    const packageSelect = document.getElementById("orderPackageSelect");
    const tonajGroup = document.getElementById("tonajWeightGroup");
    const summaryBox = document.getElementById("orderSummaryBox");
    const ibanBankEl = document.getElementById("ibanBankName");
    const ibanHolderEl = document.getElementById("ibanHolderName");
    const ibanNumberEl = document.getElementById("ibanNumberText");

    if (ibanBankEl) ibanBankEl.textContent = settings.bankName;
    if (ibanHolderEl) ibanHolderEl.textContent = settings.ibanHolder;
    if (ibanNumberEl) ibanNumberEl.textContent = settings.ibanNumber;

    // 🗺️ 81 İl ve İlçe Seçim Dropbox (Select) Doldurma
    const citySelect = document.getElementById("custCity");
    const districtSelect = document.getElementById("custDistrict");
    if (citySelect && districtSelect && citySelect.tagName === "SELECT") {
      const TURKEY_LOCATIONS = {
        "İstanbul": ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
        "Ankara": ["Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"],
        "İzmir": ["Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"],
        "Ordu": ["Akkuş", "Altınordu", "Aybastı", "Çamaş", "Çatalpınar", "Çaybaşı", "Fatsa", "Gölköy", "Gülyalı", "Gürgentepe", "İkizce", "Kabadüz", "Kabataş", "Korgan", "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye"],
        "Adana": ["Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş", "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"],
        "Adıyaman": ["Merkez", "Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Samsat", "Sincik", "Tut"],
        "Afyonkarahisar": ["Merkez", "Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dinar", "Emirdağ", "İhsaniye", "Sandıklı", "Sinanpaşa", "Sultandağı", "Şuhut"],
        "Ağrı": ["Merkez", "Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Patnos", "Taşlıçay", "Tutak"],
        "Aksaray": ["Merkez", "Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Ortaköy", "Sarıyahşi", "Sultanhanı"],
        "Amasya": ["Merkez", "Göynücek", "Gümüşhacıköy", "Hamamözü", "Merzifon", "Suluova", "Taşova"],
        "Antalya": ["Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"],
        "Ardahan": ["Merkez", "Çıldır", "Damal", "Göle", "Hanak", "Posof"],
        "Artvin": ["Merkez", "Ardanuç", "Arhavi", "Borçka", "Hopa", "Kemalpaşa", "Murgul", "Şavşat", " Yusufeli"],
        "Aydın": ["Bozdoğan", "Buharkent", "Çine", "Didim", "Efeler", "Germencik", "İncirliova", "Karacasu", "Karpuzlu", "Koçarlı", "Köşk", "Kuşadası", "Kuyucak", "Nazilli", "Söke", "Sultanhisar", "Yenipazar"],
        "Balıkesir": ["Altıeylül", "Ayvalık", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", "Edremit", "Erdek", "Gömeç", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", "Manyas", "Marmara", "Savaştepe", "Sındırgı", "Susurluk"],
        "Bartın": ["Merkez", "Amasra", "Kurucaşile", "Ulus"],
        "Batman": ["Merkez", "Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Sason"],
        "Bayburt": ["Merkez", "Aydıntepe", "Demirözü"],
        "Bilecik": ["Merkez", "Bozüyük", "Gölpazarı", "İnhisar", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"],
        "Bingöl": ["Merkez", "Adaklı", "Genç", "Karlıova", "Kiğı", "Solhan", "Yayladere", "Yedisu"],
        "Bitlis": ["Merkez", "Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Mutki", "Tatvan"],
        "Bolu": ["Merkez", "Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Mudurnu", "Seben", "Yeniçağa"],
        "Burdur": ["Merkez", "Ağlasun", "Altınyayla", "Bucak", "Çavdır", "Çeltikçi", "Gölhisar", "Karamanlı", "Kemer", "Tefenni", "Yeşilova"],
        "Bursa": ["Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"],
        "Çanakkale": ["Merkez", "Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Eceabat", "Ezine", "Gelibolu", "Gökçeada", "Lapseki", "Yenice"],
        "Çankırı": ["Merkez", "Atkaracalar", "Bayramören", "Çerkeş", "Eldivan", "Ilgaz", "Kızılırmak", "Korgun", "Kurşunlu", "Orta", "Şabanözü", "Yapraklı"],
        "Çorum": ["Merkez", "Alaca", "Bayat", "Boğazkale", "Dodurga", "İskilip", "Kargı", "Laçin", "Mecitözü", "Oğuzlar", "Ortaköy", "Osmancık", "Sungurlu", "Uğurludağ"],
        "Denizli": ["Acıpayam", "Babadağ", "Baklan", "Bekilli", "Beyağaç", "Bozkurt", "Buldan", "Çal", "Çameli", "Çardak", "Çivril", "Güney", "Honaz", "Kale", "Merkezefendi", "Pamukkale", "Sarayköy", "Serinhisar", "Tavas"],
        "Diyarbakır": ["Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani", "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir"],
        "Düzce": ["Merkez", "Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Yığılca"],
        "Edirne": ["Merkez", "Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Süloğlu", "Uzunköprü"],
        "Elazığ": ["Merkez", "Ağın", "Alacakaya", "Arıcak", "Baskil", "Karakoçan", "Keban", "Kovancılar", "Maden", "Palu", "Sivrice"],
        "Erzincan": ["Merkez", "Çayırlı", "İliç", "Kemah", "Kemaliye", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"],
        "Erzurum": ["Aşkale", "Aziziye", "Çat", "Hınıs", "Horasan", "İspir", "Karaçoban", "Karayazı", "Köprüköy", "Narman", "Oltu", "Olur", "Palandöken", "Pasinler", "Pazaryolu", "Şenkaya", "Tekman", "Tortum", "Uzundere", "Yakutiye"],
        "Eskişehir": ["Alpu", "Beylikova", "Çifteler", "Günyüzü", "Han", "İnönü", "Mahmudiye", "Mihalgazi", "Mihalıççık", "Odunpazarı", "Sarıcakaya", "Seyitgazi", "Sivrihisar", "Tepebaşı"],
        "Gaziantep": ["Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli"],
        "Giresun": ["Merkez", "Alucra", "Bulancak", "Çamoluk", "Çanakçı", "Dereli", "Doğankent", "Espiye", "Eynesil", "Görele", "Güce", "Keşap", "Piraziz", "Şebinkarahisar", "Tirebolu", "Yağlıdere"],
        "Gümüşhane": ["Merkez", "Kelkit", "Köse", "Kürtün", "Şiran", "Torul"],
        "Hakkari": ["Merkez", "Çukurca", "Derecik", "Şemdinli", "Yüksekova"],
        "Hatay": ["Altınözü", "Antakya", "Arsuz", "Belen", "Defne", "Dörtyol", "Erzin", "Hassa", "İskenderun", "Kırıkhan", "Kumlu", "Payas", "Reyhanlı", "Samandağ", "Yayladağı"],
        "Iğdır": ["Merkez", "Aralık", "Karakoyunlu", "Tuzluca"],
        "Isparta": ["Merkez", "Aksu", "Atabey", "Eğirdir", "Gelendost", "Gönen", "Keçiborlu", "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Yenişarbademli"],
        "Kahramanmaraş": ["Afşin", "Andırın", "Çağlayancerit", "Dulkadiroğlu", "Ekinözü", "Elbistan", "Göksun", "Nurhak", "Onikişubat", "Pazarcık", "Türkoğlu"],
        "Karabük": ["Merkez", "Eflani", "Eskipazar", "Ovacık", "Safranbolu", "Yenice"],
        "Karaman": ["Merkez", "Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Sarıveliler"],
        "Kars": ["Merkez", "Akyaka", "Arpaçay", "Digor", "Kağızman", "Sarıkamış", "Selim", "Susuz"],
        "Kastamonu": ["Merkez", "Abana", "Ağlı", "Araç", "Azdavay", "Bozkurt", "Cide", "Çatalzeytin", "Daday", "Devrekani", "Doğanyurt", "Hanönü", "İhsangazi", "İnebolu", "Küre", "Pınarbaşı", "Seydiler", "Şenpazar", "Taşköprü", "Tosya"],
        "Kayseri": ["Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan", "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza", "Yahyalı", "Yeşilhisar"],
        "Kırıkkale": ["Merkez", "Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Sulakyurt", "Yahşihan"],
        "Kırklareli": ["Merkez", "Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Pehlivanköy", "Pınarhisar", "Vize"],
        "Kırşehir": ["Merkez", "Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Mucur"],
        "Kilis": ["Merkez", "Elbeyli", "Musabeyli", "Polateli"],
        "Kocaeli": ["Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük", "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez"],
        "Konya": ["Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli", "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli", "Güneysınır", "Hadim", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar", "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent", "Tuzlukçu", "Yalıhüyük", "Yunak"],
        "Kütahya": ["Merkez", "Altıntaş", "Aslanapa", "Çavdarhisar", "Domaniç", "Dumlupınar", "Emet", "Gediz", "Hisarcık", "Pazarlar", "Simav", "Şaphane", "Tavşanlı"],
        "Malatya": ["Akçadağ", "Arapgir", "Arguvan", "Battalgazi", "Darende", "Doğanşehir", "Doğanyol", "Hekimhan", "Kale", "Kuluncak", "Pütürge", "Yazıhan", "Yeşilyurt"],
        "Manisa": ["Ahmetli", "Akhisar", "Alaşehir", "Demirci", "Gölmarmara", "Gördes", "Kırkağaç", "Köprübaşı", "Kula", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma", "Şehzadeler", "Turgutlu", "Yunusemre"],
        "Mardin": ["Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"],
        "Mersin": ["Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar", "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir"],
        "Muğla": ["Bodrum", "Dalaman", "Datça", "Fethiye", "Kavaklıdere", "Köyceğiz", "Marmaris", "Menteşe", "Milas", "Ortaca", "Seydikemer", "Ula", "Yatağan"],
        "Muş": ["Merkez", "Bulanık", "Hasköy", "Korkut", "Malazgirt", "Varto"],
        "Nevşehir": ["Merkez", "Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Ürgüp"],
        "Niğde": ["Merkez", "Altunhisar", "Bor", "Çamardı", "Çiftlik", "Ulukışla"],
        "Osmaniye": ["Merkez", "Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Sumbas", "Toprakkale"],
        "Rize": ["Merkez", "Ardeşen", "Çamlıhemşin", "Çayeli", "Derepazarı", "Fındıklı", "Güneysu", "Hemşin", "İkizdere", "İyidere", "Kalkandere", "Pazar"],
        "Sakarya": ["Adapazarı", "Akyazı", "Arifiye", "Erenler", "Ferizli", "Geyve", "Hendek", "Karapürçek", "Karasu", "Kaynarca", "Kocaali", "Pamukova", "Sapanca", "Serdivan", "Söğütlü", "Taraklı"],
        "Samsun": ["19 Mayıs", "Alaçam", "Asarcık", "Atakum", "Ayvacık", "Bafra", "Canik", "Çarşamba", "Havza", "İlkadım", "Kavak", "Ladik", "Salıpazarı", "Tekkeköy", "Terme", "Vezirköprü", "Yakakent"],
        "Siirt": ["Merkez", "Baykan", "Eruh", "Kurtalan", "Pervari", "Şirvan", "Tillo"],
        "Sinop": ["Merkez", "Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Saraydüzü", "Türkeli"],
        "Sivas": ["Merkez", "Akıncılar", "Altınyayla", "Divriği", "Doğanşar", "Gemerek", "Gölova", "Gürün", "Hafik", "İmranlı", "Kangal", " Koyulhisar", "Suşehri", "Şarkışla", "Ulaş", "Yıldızeli", "Zara"],
        "Şanlıurfa": ["Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti", "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"],
        "Şırnak": ["Merkez", "Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Silopi", "Uludere"],
        "Tekirdağ": ["Çerkezköy", "Çorlu", "Ergene", "Hayrabolu", "Kapaklı", "Malkara", "Marmaraereğlisi", "Muratlı", "Saray", "Süleymanpaşa", "Şarköy"],
        "Tokat": ["Merkez", "Almus", "Artova", "Başçiftlik", "Erbaa", "Niksar", "Pazar", "Reşadiye", "Sulusaray", "Turhal", "Yeşilyurt", "Zile"],
        "Trabzon": ["Akçaabat", "Araklı", "Arsin", "Beşikdüzü", "Çarşıbaşı", "Çaykara", "Dernekpazarı", "Düzköy", "Hayrat", "Köprübaşı", "Maçka", "Of", "Ortahisar", "Sürmene", "Şalpazarı", "Tonya", "Vakfıkebir", "Yomra"],
        "Tunceli": ["Merkez", "Çemişgezek", "Hozat", "Mazgirt", "Nazımiye", "Ovacık", "Pertek", "Pülümür"],
        "Uşak": ["Merkez", "Banaz", "Eşme", "Karahallı", "Sivaslı", "Ulubey"],
        "Van": ["Bahçesaray", "Başkale", "Çaldıran", "Çatak", "Edremit", "Erciş", "Gevaş", "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Saray", "Tuşba"],
        "Yalova": ["Merkez", "Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Termal"],
        "Yozgat": ["Merkez", "Akdağmadeni", "Aydıncık", "Boğazlıyan", "Çandır", "Çayıralan", "Çekerek", "Kadışehri", "Saraykent", "Sarıkaya", "Sorgun", "Şefaatli", "Yenifakılı", "Yerköy"],
        "Zonguldak": ["Merkez", "Alaplı", "Çaycuma", "Devrek", "Ereğli", "Gökçebey", "Kilimli", "Kozlu"]
      };

      citySelect.innerHTML =
        `<option value="">İl Seçiniz...</option>` +
        Object.keys(TURKEY_LOCATIONS)
          .map(city => `<option value="${city}">${city}</option>`)
          .join("");

      citySelect.addEventListener("change", () => {
        const selectedCity = citySelect.value;
        const districts = TURKEY_LOCATIONS[selectedCity] || [];
        if (!selectedCity || !districts.length) {
          districtSelect.innerHTML = `<option value="">Önce İl Seçiniz...</option>`;
          districtSelect.disabled = true;
          return;
        }
        districtSelect.disabled = false;
        districtSelect.innerHTML =
          `<option value="">İlçe Seçiniz...</option>` +
          districts.map(d => `<option value="${d.trim()}">${d.trim()}</option>`).join("");
      });
    }

    // Paket seçeneklerini doldur
    if (packageSelect) {
      packageSelect.innerHTML = products
        .map(
          p =>
            `<option value="${p.id}" data-price="${p.price}" data-wholesale="${p.isWholesale}">
              ${p.name.replace(/\s*\(.*?\)\s*/g, "")} — ${p.priceText}
            </option>`
        )
        .join("");

      // URL'den gelen paket parametresini seç
      const urlParams = new URLSearchParams(window.location.search);
      const selectedPkg = urlParams.get("paket");
      if (selectedPkg && products.some(p => p.id === selectedPkg)) {
        packageSelect.value = selectedPkg;
      }
    }

    const updateSummary = () => {
      if (!packageSelect) return;
      const selectedId = packageSelect.value;
      const product = products.find(p => p.id === selectedId) || products[0];
      const qtyInput = document.getElementById("orderQtyInput");
      const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : "1", 10) || 1);

      if (tonajGroup) {
        tonajGroup.style.display = product.isWholesale ? "flex" : "none";
      }

      if (summaryBox && product) {
        const totalText = product.isWholesale
          ? "Toptan / Tonaj Özel Fiyat Teklifi"
          : `₺${(product.price * qty).toLocaleString("tr-TR")}`;

        summaryBox.innerHTML = `
          <div class="kunye-row">
            <span class="kunye-label">Seçilen Paket:</span>
            <strong class="kunye-val">${product.name}</strong>
          </div>
          <div class="kunye-row">
            <span class="kunye-label">Randıman Oranı:</span>
            <strong class="kunye-val">${product.randiman}</strong>
          </div>
          <div class="kunye-row">
            <span class="kunye-label">Hasat Yılı:</span>
            <strong class="kunye-val">${product.harvestYear}</strong>
          </div>
          <div class="kunye-row">
            <span class="kunye-label">Köy / Menşei:</span>
            <strong class="kunye-val">${product.originLocation}</strong>
          </div>
          <div class="kunye-row">
            <span class="kunye-label">Kırım / Paketleme:</span>
            <strong class="kunye-val">${product.packagingDate}</strong>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:0.75rem; margin-top:0.25rem; border-top:1px solid var(--border-color); font-size:1.15rem;">
            <span style="font-weight:600; white-space:nowrap;">Toplam Tutar:</span>
            <strong style="color:var(--primary); text-align:right; white-space:nowrap;">${totalText}</strong>
          </div>
        `;
      }
    };

    if (packageSelect) packageSelect.addEventListener("change", updateSummary);
    const qtyInput = document.getElementById("orderQtyInput");
    if (qtyInput) qtyInput.addEventListener("input", updateSummary);
    updateSummary();

    // Form ilk etkileşiminde GA4 event
    let formStarted = false;
    orderForm.addEventListener("focusin", () => {
      if (!formStarted && window.DuayeriTracker) {
        formStarted = true;
        window.DuayeriTracker.pushEvent("order_form_start", { page: "siparis" });
      }
    });

    // Form Gönderimi (PRIMARY CONVERSION)
    orderForm.addEventListener("submit", e => {
      e.preventDefault();
      const selectedId = packageSelect ? packageSelect.value : products[0].id;
      const product = products.find(p => p.id === selectedId) || products[0];
      const qty = Math.max(1, parseInt(document.getElementById("orderQtyInput")?.value || "1", 10));
      const tonajKg = document.getElementById("tonajKgInput")?.value || "";
      const customerName = document.getElementById("custName")?.value.trim() || "";
      const phone = document.getElementById("custPhone")?.value.trim() || "";
      const cityVal = document.getElementById("custCity")?.value.trim() || "";
      const districtVal = document.getElementById("custDistrict")?.value.trim() || "";
      const city = districtVal ? `${cityVal} / ${districtVal}` : cityVal;
      const address = document.getElementById("custAddress")?.value.trim() || "";
      const cargoCompany = document.getElementById("custCargo")?.value || "Yurtiçi Kargo";
      const note = document.getElementById("custNote")?.value.trim() || "";

      const orderNo = `DF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const numericValue = product.isWholesale ? 0 : product.price * qty;
      const totalText = product.isWholesale
        ? `Tonaj Talebi (${tonajKg || "Belirtilmedi"} KG)`
        : `₺${numericValue.toLocaleString("tr-TR")}`;

      const utm = window.DuayeriTracker ? window.DuayeriTracker.getUTM() : {};

      const newOrder = {
        orderNo,
        customerName,
        phone,
        city,
        address,
        packageId: product.id,
        packageName: product.name,
        quantity: qty,
        tonajKg,
        totalText,
        cargoCompany,
        trackingCode: "",
        status: product.isWholesale ? "Tonaj Fiyat Teklifi Bekliyor" : "Havale/EFT Onayı Bekleniyor",
        note,
        utmSource: utm.utm_source || "direct",
        createdAt: new Date().toLocaleString("tr-TR")
      };

      window.SiteData.addOrder(newOrder);

      // ⭐ PRIMARY CONVERSION TETİKLE (Google Ads + Meta + TikTok + GA4)
      if (window.DuayeriTracker) {
        window.DuayeriTracker.trackFormLeadConversion({
          orderNo,
          packageName: product.name,
          numericValue
        });
      }

      // Onay kutusunu göster ve WhatsApp mesajı hazırla
      const resultBox = document.getElementById("orderSuccessResult");
      const cleanWa = (settings.whatsapp || "905320005252").replace(/\D/g, "");
      const waOrderMsg = `Merhaba Duayeri Fındık! Sipariş/Talep oluşturdum.\nSipariş No: ${orderNo}\nAd Soyad: ${customerName}\nPaket: ${product.name} (Adet: ${qty})\n${product.isWholesale ? "Talep Edilen Tonaj: " + tonajKg + " KG\n" : ""
        }Tutar: ${totalText}\nKargo Tercihi: ${cargoCompany}\nİl/İlçe: ${city}`;

      if (resultBox) {
        resultBox.style.display = "block";
        resultBox.innerHTML = `
          <div style="background:#E8F5E9; border:2px solid var(--success); border-radius:var(--radius-md); padding:1.5rem; margin-top:1.5rem;">
            <h3 style="color:var(--success); margin-bottom:0.5rem;">✅ Sipariş Talebiniz Alındı! (No: ${orderNo})</h3>
            <p style="margin-bottom:0.75rem; font-size:0.95rem;">
              Sayın <strong>${customerName}</strong>, siparişiniz sistemimize kaydedildi. Havale/EFT açıklama kısmına <strong>${orderNo}</strong> yazarak ödemenizi tamamlayabilir veya dekontunuzu aşağıdaki butondan doğrudan WhatsApp hattımıza iletebilirsiniz.
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
              <a href="https://wa.me/${cleanWa}?text=${encodeURIComponent(waOrderMsg)}"
                 target="_blank"
                 rel="noopener"
                 class="btn btn-whatsapp"
                 data-track-whatsapp="order_success_whatsapp"
                 data-product="${product.name}">
                 💬 Siparişi WhatsApp'tan Onayla / Dekont Gönder
              </a>
              <a href="kargo-takip.html?q=${encodeURIComponent(orderNo)}" class="btn btn-light">
                 📦 Sipariş & Kargo Sorgula
              </a>
            </div>
          </div>
        `;
        resultBox.scrollIntoView({ behavior: "smooth" });
      }
    });
  },

  // 📦 Kargo Takip & Entegrasyon Sayfası (Yurtiçi / Aras / MNG)
  setupCargoTrackingPage() {
    const searchForm = document.getElementById("cargoSearchForm");
    if (!searchForm || !window.SiteData) return;

    const inputEl = document.getElementById("cargoQueryInput");
    const resultContainer = document.getElementById("cargoResultContainer");

    const runSearch = queryStr => {
      const results = window.SiteData.findOrder(queryStr);
      if (!results.length) {
        resultContainer.innerHTML = `
          <div class="form-card" style="margin-top:1.5rem; text-align:center;">
            <p style="color:var(--text-muted);">Aradığınız kriterlere uygun sipariş bulunamadı. Lütfen Sipariş Numaranızı (Örn: <strong>DF-2026-1042</strong>) veya telefon numaranızı kontrol edin.</p>
          </div>
        `;
        return;
      }

      const carrierLinks = {
        "Yurtiçi Kargo": "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=",
        "Aras Kargo": "https://kargotakip.araskargo.com.tr/mainpage.aspx?code=",
        "MNG Kargo": "https://www.mngkargo.com.tr/gonderi-takip?code="
      };

      resultContainer.innerHTML = results
        .map(order => {
          const baseCarrierUrl = carrierLinks[order.cargoCompany] || "https://www.google.com/search?q=";
          const trackUrl = order.trackingCode
            ? `${baseCarrierUrl}${encodeURIComponent(order.trackingCode)}`
            : baseCarrierUrl;

          return `
          <div class="form-card" style="margin-top:1.5rem;">
            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; gap:1rem; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1rem;">
              <div>
                <span style="font-size:0.8rem; color:var(--text-muted);">Sipariş Numarası</span>
                <h3 style="font-size:1.35rem; color:var(--primary);">${order.orderNo}</h3>
              </div>
              <div>
                <span style="background:var(--bg-sage); color:var(--primary); padding:0.4rem 0.9rem; border-radius:var(--radius-pill); font-weight:700; font-size:0.85rem;">
                  📌 ${order.status}
                </span>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; font-size:0.92rem; margin-bottom:1.25rem;">
              <div><strong>Müşteri:</strong> ${order.customerName}</div>
              <div><strong>Paket:</strong> ${order.packageName}</div>
              <div><strong>Tutar:</strong> ${order.totalText}</div>
              <div><strong>Kargo Firması:</strong> ${order.cargoCompany}</div>
              <div><strong>Kargo Takip Kodu:</strong> ${order.trackingCode || "Henüz atanmadı (Hazırlanıyor)"}</div>
              <div><strong>Tarih:</strong> ${order.createdAt}</div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
              <a href="${trackUrl}" target="_blank" rel="noopener" class="btn btn-primary">
                🚚 ${order.cargoCompany} Resmi Sitesinde Canlı Sorgula
              </a>
            </div>
          </div>
        `;
        })
        .join("");
    };

    searchForm.addEventListener("submit", e => {
      e.preventDefault();
      if (inputEl && inputEl.value.trim()) {
        runSearch(inputEl.value.trim());
      }
    });

    const urlQ = new URLSearchParams(window.location.search).get("q");
    if (urlQ && inputEl) {
      inputEl.value = urlQ;
      runSearch(urlQ);
    }
  },

  setupContactPage() {
    const contactForm = document.getElementById("duayeriContactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = document.getElementById("contactName")?.value.trim() || "";
      const phone = document.getElementById("contactPhone")?.value.trim() || "";
      const msg = document.getElementById("contactMsg")?.value.trim() || "";

      if (window.DuayeriTracker) {
        window.DuayeriTracker.trackFormLeadConversion({
          orderNo: "ILETISIM-FORM",
          packageName: "İletişim Mesajı",
          numericValue: 0
        });
      }

      const feedback = document.getElementById("contactFormFeedback");
      if (feedback) {
        feedback.style.display = "block";
        feedback.innerHTML = `
          <div style="background:#E8F5E9; border:1px solid var(--success); padding:1rem; border-radius:var(--radius-sm); margin-top:1rem; color:var(--success); font-weight:600;">
            ✅ Teşekkürler ${name}! Mesajınız bize ulaştı. En kısa sürede ${phone} numaranızdan dönüş yapacağız.
          </div>
        `;
        contactForm.reset();
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  DuayeriApp.init();
});

