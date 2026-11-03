/**
 * DUAYERİ FINDIK — Reklam, Analitik & Primary Dönüşüm Takip Motoru
 * Google Ads + Google Analytics 4 (GA4) + Meta (Facebook/Instagram) Pixel + TikTok Pixel
 *
 * ⭐ PRIMARY DÖNÜŞÜM 1: WhatsApp Tıklaması (Contact / whatsapp_click)
 * ⭐ PRIMARY DÖNÜŞÜM 2: Sipariş Formu Gönderimi (Lead / order_form_submit)
 */

window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}

const DuayeriTracker = {
  init() {
    this.captureUTMParams();
    this.bindGlobalClickTrackers();
    this.pushEvent("page_view_duayeri", {
      page_path: window.location.pathname,
      page_title: document.title,
      utm_source: this.getUTM().utm_source || "direct"
    });
  },

  // UTM parametrelerini yakalar ve sessionStorage + localStorage'a kaydeder (ROI ölçümü)
  captureUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ttclid"];
    const stored = this.getUTM();
    let updated = false;

    keys.forEach(k => {
      if (params.has(k)) {
        stored[k] = params.get(k);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem("DUAYERI_UTM_DATA", JSON.stringify(stored));
    }
  },

  getUTM() {
    try {
      return JSON.parse(localStorage.getItem("DUAYERI_UTM_DATA") || "{}");
    } catch (e) {
      return {};
    }
  },

  // Tüm platformlara ortak event gönderimi
  pushEvent(eventName, payload = {}) {
    const utm = this.getUTM();
    const enriched = {
      ...payload,
      utm_source: utm.utm_source || "organic",
      utm_medium: utm.utm_medium || "none",
      utm_campaign: utm.utm_campaign || "none",
      timestamp: new Date().toISOString()
    };

    // 1. Google Tag Manager & GA4 dataLayer
    window.dataLayer.push({
      event: eventName,
      ...enriched
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, enriched);
    }

    // 2. Meta (Facebook / Instagram) Pixel
    if (typeof window.fbq === "function") {
      if (eventName === "whatsapp_primary_conversion") {
        window.fbq("track", "Contact", enriched);
      } else if (eventName === "lead_primary_conversion") {
        window.fbq("track", "Lead", enriched);
      } else {
        window.fbq("trackCustom", eventName, enriched);
      }
    }

    // 3. TikTok Pixel
    if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
      if (eventName === "whatsapp_primary_conversion") {
        window.ttq.track("Contact", enriched);
      } else if (eventName === "lead_primary_conversion") {
        window.ttq.track("SubmitForm", enriched);
      } else {
        window.ttq.track(eventName, enriched);
      }
    }
  },

  // ⭐ PRIMARY CONVERSION 1: WhatsApp İletişim Tıklaması
  trackWhatsAppConversion(locationLabel = "floating_button", productInfo = "") {
    const settings = window.SiteData ? window.SiteData.getData().settings : {};
    this.pushEvent("whatsapp_primary_conversion", {
      conversion_priority: "PRIMARY",
      conversion_type: "whatsapp_click",
      button_location: locationLabel,
      product_context: productInfo,
      send_to: settings.googleAdsId
        ? `${settings.googleAdsId}/${settings.googleAdsWhatsappLabel || "WA_PRIMARY"}`
        : undefined
    });
  },

  // ⭐ PRIMARY CONVERSION 2: Sipariş / Teklif Formu Gönderimi
  trackFormLeadConversion(orderData = {}) {
    const settings = window.SiteData ? window.SiteData.getData().settings : {};
    this.pushEvent("lead_primary_conversion", {
      conversion_priority: "PRIMARY",
      conversion_type: "order_form_submit",
      order_no: orderData.orderNo || "",
      package_name: orderData.packageName || "",
      value: Number(orderData.numericValue || 0),
      currency: "TRY",
      send_to: settings.googleAdsId
        ? `${settings.googleAdsId}/${settings.googleAdsLeadLabel || "FORM_PRIMARY"}`
        : undefined
    });
  },

  bindGlobalClickTrackers() {
    document.addEventListener("click", e => {
      const waLink = e.target.closest("[data-track-whatsapp]");
      if (waLink) {
        const loc = waLink.getAttribute("data-track-whatsapp") || "whatsapp_button";
        const prod = waLink.getAttribute("data-product") || "";
        this.trackWhatsAppConversion(loc, prod);
      }

      const phoneLink = e.target.closest("a[href^='tel:']");
      if (phoneLink) {
        this.pushEvent("phone_click", { phone_href: phoneLink.getAttribute("href") });
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  DuayeriTracker.init();
});

window.DuayeriTracker = DuayeriTracker;

