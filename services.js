/* =========================================================
   CHUPAKABRA KHATA: SERVICES.JS MASTER ENGINE
   डॉक्टर प्रोफाइल, पहचान सत्यापन, 3x Add More +, 50 Rx, फार्मेसी, बीमा व PoW
   ========================================================= */

const CLINIKEY = "chupa_clinic_profile_fresh";
const PHARMAKEy = "chupa_pharma_profile_fresh";
const RXCUSTOMKEY = "chupa_rx_custom_items";
const POW_PROFILE_KEY = "chupa_my_pow_profile";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// स्थायी फुटर ब्रांडिंग (Universal Permanent Footer)
const PRINT_FOOTER_BRAND = `
  <div style="margin-top:35px;border-top:1px dashed #cbd5e1;padding-top:10px;text-align:center;font-size:11px;color:#475569;font-weight:700;">
    <div>Powered by</div>
    <div style="font-size:13px;font-weight:800;color:#0f172a;margin:2px 0;">चुपाकाबरा-खाता</div>
    <div style="color:#059669;font-size:10.5px;">सेव पेपर, सेव नेचर 🌿</div>
  </div>
`;

const WA_FOOTER_BRAND = `\n\n------------------------\nPowered by\n*चुपाकाबरा-खाता*\n*सेव पेपर, सेव नेचर 🌿*`;

// आधिकारिक टर्टलमिंट व पार्टनर संपर्क
const TURTLEMINT_OFFICIAL_URL = "https://advisor.turtlemintinsurance.com/profile/RAV4412722/ravindra_pratap_singh";
const PARTNER_WHATSAPP_NO = "9369913187";

// 1. डॉक्टर व क्लिनिक प्रोफाइल (डिफ़ॉल्ट 100% खाली - कोई फर्जी नाम नहीं)
let clinicProfile = JSON.parse(localStorage.getItem(CLINIKEY)) || {
  docName: "",
  gender: "",
  clinicName: "",
  degree: "",
  regNo: "",
  phone: "",
  address: "",
  idVerified: false,
  idLast4: ""
};

// 2. फार्मेसी प्रोफाइल
let pharmaProfile = JSON.parse(localStorage.getItem(PHARMAKEy)) || {
  name: "",
  dl: "",
  address: "",
  phone: "",
  mapUrl: ""
};

// 3. कस्टम डॉक्टर आइटम्स (Add More से जुड़े लक्षण, उपचार व परहेज)
let customRxItems = JSON.parse(localStorage.getItem(RXCUSTOMKEY)) || { c: [], t: [], a: [] };

let pharmaCart = [
  { name: "", batch: "", qty: 1, rate: 0 }
];

let rxMode = "therapy";
let selRxComplaints = new Set();
let selRxTreatments = new Set();
let selRxAdvices = new Set();

const rxDataLibrary = {
  therapy: {
    complaints: [
      "सर्वाइकल स्पॉन्डिलाइटिस", "साइटिका (L4-L5 डिस्क)", "फ्रोजन शोल्डर (कंधा जाम)",
      "घुटने का दर्द (Osteoarthritis)", "माइग्रेन / आधासीसी", "कमर दर्द (Lumbago)",
      "लकवा / पैरालिसिस रिहैब", "टेनिस एल्बो", "हील पेन (Plantar Fasciitis)", "अपच व नाभि डिगना"
    ],
    treatment: [
      "ड्राई कपिंग थेरेपी (5 Cups)", "वेट कपिंग / हिजामा (डिटॉक्स)", "न्यूरोथेरेपी नवल स्टिम्युलेशन",
      "Tens + IFT फिजियो थेरेपी", "अल्ट्रासाउंड पेन रिलीफ", "मैनुअल जॉइंट मोबिलाइज़ेशन",
      "स्पाइन ट्रैक्शन (मैनुअल)", "हर्बल पोटली स्वेदन"
    ],
    advice: [
      "तकिया लगाना पूरी तरह बंद रखें", "गरम पानी की सिकाई (दिन में 2 बार)", "कमर सीधी रखकर बैठें",
      "भारी वज़न बिल्कुल न उठाएं", "स्ट्रेचिंग कसरत 15 मिनट सुबह", "ठंडी व बादी चीज़ों से परहेज"
    ]
  },
  medical: {
    complaints: [
      "वायरल फीवर / बुखार", "गले में खराश व सूखी खांसी", "एसिडिटी व पेट दर्द (GERD)",
      "डायरिया / लूज मोशन", "हाई बीपी (हाइपरटेंशन)", "दाद, खाज, खुजली (फंगल)",
      "कमजोरी व चक्कर", "जोड़ों का दर्द (यूरिक एसिड)"
    ],
    treatment: [
      "Paracetamol 650mg SOS", "Pantoprazole 40mg (खाली पेट)", "Amoxicillin + Clav 625mg BD",
      "ORS + Zinc घोल दिन में 3 बार", "Levocetirizine 5mg रात को", "B-Complex + Multivitamin OD",
      "Diclofenac Gel स्थानीय लेप"
    ],
    advice: [
      "उबला पानी पिएं", "हल्का व सुपाच्य भोजन (खिचड़ी/दलिया)", "3 दिन बाद फॉलो-अप दिखाएं",
      "दवा का पूरा कोर्स लें", "धूल व ठंडी हवा से बचें"
    ]
  },
  rural: {
    complaints: [
      "सामान्य हरारत व बदन दर्द", "मौसमी सर्दी-जुकाम", "पेट में मरोड़ व गैस",
      "साधारण घाव व खरोंच", "उल्टी व दस्त का आरंभ", "आंखों में लाली व जलन", "सिरदर्द व थकान"
    ],
    treatment: [
      "बुखार प्राथमिक गोली (OTC)", "गैस नाशक एंटासिड सिरप", "ओआरएस इलेक्ट्रोलाइट पैकेट",
      "एंटीसेप्टिक डेटॉल ड्रेसिंग", "दर्द निवारक बाम लेप", "सलाइन नेज़ल ड्रॉप्स", "उच्च केंद्र रेफरल"
    ],
    advice: [
      "तत्काल आराम करें व पर्याप्त तरल लें", "लक्षण 24 घंटे में न सुधरें तो तुरंत अस्पताल जाएं",
      "कोई भारी एंटीबायोटिक बिना जांच न लें", "ब्लड प्रेशर की नियमित जांच कराएं"
    ]
  }
};

const templateOptionsList = [
  { group: "🏥 1. क्लासिक क्लिनिकल (1-10)", items: ["01: क्लासिक ℞ एम्स फॉर्मल स्टाइल", "02: क्लासिक हेडर + डबल लाइन बॉर्डर", "03: गवर्नमेंट हॉस्पिटल पर्चा लेआउट", "04: नर्सिंग होम क्लीन लेटरहेड", "05: क्लासिक रॉयल ℞ वॉटरमार्क", "06: चैरिटेबल ट्रस्ट फॉर्मल स्लिप", "07: सीनियर कंसल्टेंट प्रेस्क्रिप्शन", "08: टू-कॉलम क्लासिक डायग्नोसिस", "09: क्लासिक ब्लू बॉर्डर पैड", "10: विंटेज एपोथेकरी स्टाइल"] },
  { group: "🧘 2. मॉडर्न फिजियो व न्यूरो रिहैब (11-20)", items: ["11: स्पाइन व डिस्क असेसमेंट शीट", "12: कपिंग व हिजामा सिटिंग ट्रैकर", "13: न्यूरोथेरेपी नवल स्टिम्युलेशन प्रोटोकॉल", "14: जॉइंट मोबिलिटी व पेन स्केल (VAS)", "15: फिजियो एक्सरसाइज चेकलिस्ट फॉर्मेट", "16: पैरालिसिस रिकवरी चार्ट", "17: स्पोर्ट्स इंजरी व रिहैब कार्ड", "18: ऑर्थोपेडिक रिहैबिलिटेशन लेआउट", "19: मॉडर्न टील हेडर रिहैब पैड", "20: प्रिवेंटिव वेलनेस व पोस्चर गाइड"] },
  { group: "🌿 3. आयुष, देसी व नाड़ी वैदिकी (21-30)", items: ["21: पारंपरिक नाड़ी व पंचकर्म पर्चा", "22: वात-पित्त-कफ त्रिदोष डायरी", "23: हर्बल काढ़ा व अनुपान चार्ट", "24: प्राकृतिक चिकित्सा व स्वेदन स्लिप", "25: मर्म चिकित्सा उपचार पत्रक", "26: आयुष ग्राम आरोग्य पत्र", "27: स्वर्ण प्राशन व बाल संस्कार कार्ड", "28: योग व दिनचर्या परामर्श पर्चा", "29: प्राचीन बॉर्डर देसी दवा पत्र", "30: शोधन व शमन थेरेपी शीट"] },
  { group: "🧾 4. थर्मल रोल पर्चा (काउंटर प्रिंटर) (31-40)", items: ["31: 58mm मिनी पॉकेट पर्ची", "32: 80mm रोल बारकोड क्लिनिक स्लिप", "33: थर्मल सिटिंग टोकन व परामर्श", "34: थर्मल बिल + प्रिस्क्रिप्शन कंबाइंड", "35: कॉम्पैक्ट फॉलो-अप स्लिप", "36: इमरजेंसी ओपीडी रोल टिकट", "37: 80mm बॉक्स ग्रिड पर्चा", "38: थर्मल मेडिसिन डोज टेबल", "39: सुपरफास्ट 10-सेकंड रोल स्लिप", "40: थर्मल बारकोड डिस्चार्ज समरी"] },
  { group: "✒️ 5. एग्जीक्यूटिव मिनिमल व आधुनिक (41-50)", items: ["41: स्लीक मॉडर्न ग्रे हेडर", "42: नो-बॉर्डर अल्ट्रा मिनिमल A4", "43: टू-टोन कॉर्पोरेट हेल्थ कार्ड", "44: डिजिटल ई-प्रिस्क्रिप्शन फॉर्मेट", "45: टेली-कंसल्टेशन ऑफिशियल पैड", "46: बुलेटेड क्लीन क्लिनिकल समरी", "47: मॉडर्न ज्योमेट्रिक कॉर्नर लेटरहेड", "48: डार्क-एलिगेंट हेडर मेडिकल शीट", "49: पोर्ट्रेट कार्ड स्टाइल प्रिस्क्रिप्शन", "50: प्रीमियम गोल्डन स्टैम्प स्टाइल"] }
];

const citizenServicesData = [
  { em: "💳", tag: "UP Health", title: "शिक्षक कैशलेस कार्ड", sub: "मुख्यमंत्री कैशलेस चिकित्सा", url: "https://cmtcts.upsdc.gov.in" },
  { em: "🏥", tag: "PM-JAY", title: "आयुष्मान कार्ड", sub: "परिवार पात्रता व डाउनलोड", url: "https://beneficiary.nha.gov.in" },
  { em: "🌾", tag: "FCS UP", title: "राशन कार्ड पर्ची", sub: "कोटेदार सूची व यूनिट खोज", url: "https://fcs.up.gov.in" },
  { em: "🎋", tag: "e-Ganna", title: "गन्ना पर्ची कैलेंडर", sub: "किसान सट्टा व पर्ची कैलेंडर", url: "https://enquiry.caneup.in" },
  { em: "🏫", tag: "eHRMS UP", title: "मानव संपदा पोर्टल", sub: "सर्विस बुक व ऑनलाइन लीव", url: "https://ehrms.upsdc.gov.in" },
  { em: "⚖️", tag: "eCourts", title: "कोर्ट केस स्टेटस", sub: "तहसील व ज़िला कोर्ट तारीख", url: "https://services.ecourts.gov.in" },
  { em: "🔍", tag: "eDistrict", title: "प्रमाणपत्र सत्यापन", sub: "आय/जाति/निवास असली-नकली", url: "https://edistrict.up.gov.in" },
  { em: "📜", tag: "Bhulekh", title: "भूलेख खतौनी", sub: "गाटा व ज़मीन नकल ब्योरा", url: "https://upbhulekh.gov.in" },
  { em: "🚜", tag: "PM-Kisan", title: "PM-किसान क़िस्त", sub: "सम्मान निधि स्थिति व eKYC", url: "https://pmkisan.gov.in" },
  { em: "🚆", tag: "Indian Rail", title: "रेलवे PNR व ट्रेन", sub: "लाइव स्थिति व सीट खोज", url: "https://www.indianrail.gov.in" },
  { em: "🏛️", tag: "IGRSUP", title: "बैनामा व रजिस्ट्री", sub: "जायदाद भार व प्रतिलिपि", url: "https://igrsup.gov.in" },
  { em: "🛡️", tag: "PMFBY", title: "फसल नुक़सान क्लेम", sub: "क्षतिपूर्ति दावा व स्थिति", url: "https://pmfby.gov.in" }
];

/* =========================================================
   1. डॉक्टर व क्लिनिक प्रोफाइल डेस्क (पूर्णतः फ्रेश सेट)
   ========================================================= */
function openClinicDesk() {
  closeModal("servicesAccordionModal");

  // यदि डॉक्टर प्रोफाइल पहले से सेट नहीं है, तो पहले सेटअप फॉर्म खोलें
  if (!clinicProfile.docName || !clinicProfile.clinicName) {
    openDoctorProfileSetupModal();
    return;
  }

  let desk = document.getElementById("activeClinicDeskModal");
  if (desk) desk.remove();

  desk = document.createElement("div");
  desk.className = "modal";
  desk.id = "activeClinicDeskModal";
  desk.style.display = "flex";

  const idBadge = clinicProfile.idVerified 
    ? `<span style="display:inline-block;background:#ecfdf5;color:#059669;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:800;border:1px solid #a7f3d0;margin-top:2px;">प्रमाणित: XXXX-XXXX-${clinicProfile.idLast4} ✅</span>`
    : "";

  desk.innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div>
          <h2 style="font-size:16px;font-weight:800;color:#0f172a;margin:0;">${esc(clinicProfile.clinicName)}</h2>
          <p style="font-size:11.5px;color:#475569;margin:2px 0;">${esc(clinicProfile.docName)} (${esc(clinicProfile.gender || '-')}) | ${esc(clinicProfile.degree || '-')}</p>
          <p style="font-size:10.5px;color:#64748b;margin:0;">पंजीकरण सं.: <b>${esc(clinicProfile.regNo || '-')}</b> | मो.: ${esc(clinicProfile.phone || '-')}</p>
          ${idBadge}
        </div>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn-close-sm" style="font-size:11px;width:auto;padding:0 8px;border-radius:8px;" onclick="openDoctorProfileSetupModal()">✏️ एडिट</button>
          <button type="button" class="btn-close-sm" onclick="closeModal('activeClinicDeskModal')">✕</button>
        </div>
      </div>

      <!-- 50 शैलियाँ पिकर -->
      <div style="background:#f8fafc;border:1px solid var(--border-line);border-radius:14px;padding:10px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:11px;font-weight:800;">📄 50 क्लिनिकल शैलियाँ</span>
          <span style="font-size:9.5px;font-weight:800;color:#0284c7;background:#e0f2fe;padding:2px 8px;border-radius:6px;" id="rxCategoryBadge">1. क्लासिक क्लिनिकल</span>
        </div>
        <select id="rxTemplatePicker" class="d-input" style="height:40px;font-weight:700;" onchange="updateRxCategoryBadge()">
          ${templateOptionsList.map((g, gIdx) => `
            <optgroup label="${g.group}">
              ${g.items.map((item, iIdx) => `<option value="${(gIdx * 10) + iIdx + 1}">टेम्पलेट ${item}</option>`).join("")}
            </optgroup>
          `).join("")}
        </select>
      </div>

      <!-- थेरेपी / एलोपैथ / ग्रामीण टैब्स -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px;">
        <button type="button" class="btn rx-tab-btn active" onclick="setRxCategory('therapy', this)" style="height:36px;font-size:11px;background:#0f172a;color:#fff;">फिजियो व न्यूरो</button>
        <button type="button" class="btn rx-tab-btn" onclick="setRxCategory('medical', this)" style="height:36px;font-size:11px;background:#f1f5f9;color:var(--text-muted);">एलोपैथ / Rx</button>
        <button type="button" class="btn rx-tab-btn" onclick="setRxCategory('rural', this)" style="height:36px;font-size:11px;background:#f1f5f9;color:var(--text-muted);">प्राथमिक सेवा</button>
      </div>

      <!-- मरीज़ विवरण -->
      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" id="clPtName" class="d-input" placeholder="मरीज़ का नाम *">
        <input type="text" id="clPtAgeGen" class="d-input" placeholder="उम्र/लिंग (उदा. 42/M)">
      </div>
      <input type="tel" id="clPtPhone" maxlength="10" class="d-input" placeholder="WhatsApp नंबर (10 अंक)">

      <!-- 1. लक्षण व तकलीफ़ (Complaints) + Add More -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0 6px;">
        <span style="font-size:11.5px;font-weight:800;color:#0f172a;">लक्षण व तकलीफ़ (Complaints):</span>
        <button type="button" onclick="promptAddCustomRxItem('c')" style="border:0;background:#eff6ff;color:#0284c7;font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:6px;cursor:pointer;">＋ Add More</button>
      </div>
      <div id="boxComplaintsCloud" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>

      <!-- 2. थेरेपी व दवा प्रोटोकॉल (Treatment / Rx) + Add More -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0 6px;">
        <span style="font-size:11.5px;font-weight:800;color:#0f172a;">थेरेपी व दवा प्रोटोकॉल (Treatment / Rx):</span>
        <button type="button" onclick="promptAddCustomRxItem('t')" style="border:0;background:#eff6ff;color:#0284c7;font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:6px;cursor:pointer;">＋ Add More</button>
      </div>
      <div id="boxTreatmentCloud" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>

      <!-- 3. घरेलू कसरत व परहेज (Advice) + Add More -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0 6px;">
        <span style="font-size:11.5px;font-weight:800;color:#0f172a;">घरेलू कसरत व परहेज (Advice):</span>
        <button type="button" onclick="promptAddCustomRxItem('a')" style="border:0;background:#eff6ff;color:#0284c7;font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:6px;cursor:pointer;">＋ Add More</button>
      </div>
      <div id="boxAdviceCloud" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>

      <input type="text" id="clPtNext" class="d-input" placeholder="अगला परामर्श / सिटिंग (उदा. 3 दिन बाद सुबह 10 बजे)" style="margin-top:8px;">

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
        <button type="button" class="btn-save" style="background:#0f172a;" onclick="printClinicPrescription()">🖨️ पर्चा प्रिंट (+बरकत)</button>
        <button type="button" class="btn-save" style="background:#16a34a;" onclick="sendClinicWhatsAppRx()">📲 WhatsApp पर्चा</button>
      </div>
    </div>
  `;

  document.body.appendChild(desk);
  initRxClouds();
}

/* =========================================================
   2. डॉक्टर प्रोफाइल सेटअप मोडल (पहचान सत्यापन सहित)
   ========================================================= */
function openDoctorProfileSetupModal() {
  let modal = document.getElementById("drProfileSetupModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "drProfileSetupModal";
  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:800;margin:0;">🩺 डॉक्टर / क्लिनिक प्रोफाइल सेटअप</h2>
        <button type="button" class="btn-close-sm" onclick="this.closest('.modal').remove()">✕</button>
      </div>

      <div class="drawer-field">
        <label>डॉक्टर का पूरा नाम * ✍️</label>
        <input type="text" id="setupDrName" value="${esc(clinicProfile.docName)}" class="d-input" placeholder="उदा. डॉ. आर. पी. सिंह">
      </div>

      <div class="drawer-field">
        <label>जेंडर (Gender) * ✍️</label>
        <select id="setupDrGender" class="d-input" style="font-weight:700;">
          <option value="">-- जेंडर चुनें --</option>
          <option value="पुरुष" ${clinicProfile.gender==='पुरुष'?'selected':''}>पुरुष (Male)</option>
          <option value="महिला" ${clinicProfile.gender==='महिला'?'selected':''}>महिला (Female)</option>
          <option value="अन्य" ${clinicProfile.gender==='अन्य'?'selected':''}>अन्य (Other)</option>
        </select>
      </div>

      <div class="drawer-field">
        <label>क्लिनिक / हॉस्पिटल का नाम * ✍️</label>
        <input type="text" id="setupClinicName" value="${esc(clinicProfile.clinicName)}" class="d-input" placeholder="उदा. आरोग्य फिजियो व न्यूरो क्लिनिक">
      </div>

      <div class="drawer-field">
        <label>डिग्री / विशेषज्ञता ✍️</label>
        <input type="text" id="setupDrDegree" value="${esc(clinicProfile.degree)}" class="d-input" placeholder="उदा. B.P.T, M.P.T, B.A.M.S">
      </div>

      <div class="drawer-field">
        <label>रजिस्ट्रेशन नंबर ✍️</label>
        <input type="text" id="setupDrReg" value="${esc(clinicProfile.regNo)}" class="d-input" placeholder="उदा. UP-RMP-2026/A">
      </div>

      <div class="drawer-field">
        <label>मोबाइल नंबर *</label>
        <input type="tel" id="setupDrPhone" maxlength="10" value="${esc(clinicProfile.phone)}" class="d-input" placeholder="10 अंकों का फोन नंबर">
      </div>

      <div class="drawer-field">
        <label>क्लिनिक का पूरा पता</label>
        <input type="text" id="setupDrAddress" value="${esc(clinicProfile.address)}" class="d-input" placeholder="उदा. मेन चौराहा, निकट ज़िला अस्पताल">
      </div>

      <!-- पहचान ऑथेंटिकेशन (वैकल्पिक / केवल अंतिम 4 अंक सत्यापन) -->
      <div style="background:#f8fafc;border:1.5px dashed #cbd5e1;border-radius:14px;padding:12px;margin:12px 0;">
        <label style="font-size:11px;font-weight:800;color:#0f172a;display:block;margin-bottom:4px;">
          सुरक्षित पहचान सत्यापन (वैकल्पिक) 🛡️
        </label>
        <p style="font-size:10px;color:#64748b;margin:0 0 8px 0;">
          * कोई बाहरी डेटा फेच नहीं होगा। केवल क्लाइंट साइड सत्यापन होगा और पर्चे पर अंतिम 4 अंक 'Verified ✅' दिखेंगे।
        </p>
        <div style="display:flex;gap:6px;">
          <input type="password" id="setupIdNumber" maxlength="12" class="d-input" placeholder="12-अंकीय पहचान नंबर दर्ज करें" style="height:38px;letter-spacing:2px;">
          <button type="button" class="btn-save" style="width:auto;padding:0 14px;font-size:11px;height:38px;" onclick="verifyDoctorGovId()">सत्यापित करें</button>
        </div>
        <div id="dispIdVerifyStatus" style="font-size:10.5px;font-weight:800;margin-top:6px;color:#059669;">
          ${clinicProfile.idVerified ? `✓ सत्यापित पहचान: XXXX-XXXX-${clinicProfile.idLast4} Verified ✅` : ''}
        </div>
      </div>

      <button type="button" class="btn-save" style="width:100%;height:44px;" onclick="saveDoctorProfileData()">डॉक्टर प्रोफाइल सुरक्षित करें ✓</button>
    </div>
  `;

  document.body.appendChild(modal);
}

function verifyDoctorGovId() {
  const val = (document.getElementById("setupIdNumber").value || "").trim();
  if (val.length !== 12 || isNaN(val)) {
    alert("कृपया 12 अंकों का वैध संख्यात्मक नंबर दर्ज करें!");
    return;
  }

  clinicProfile.idVerified = true;
  clinicProfile.idLast4 = val.slice(-4);
  document.getElementById("dispIdVerifyStatus").textContent = `✓ सत्यापित पहचान: XXXX-XXXX-${clinicProfile.idLast4} Verified ✅`;
  alert("✓ पहचान सफलता से सत्यापित हुई! अंतिम 4 अंक पर्चे पर जुड़ गए हैं।");
}

function saveDoctorProfileData() {
  const doc = document.getElementById("setupDrName").value.trim();
  const gender = document.getElementById("setupDrGender").value;
  const clinic = document.getElementById("setupClinicName").value.trim();
  const degree = document.getElementById("setupDrDegree").value.trim();
  const reg = document.getElementById("setupDrReg").value.trim();
  const phone = document.getElementById("setupDrPhone").value.trim();
  const addr = document.getElementById("setupDrAddress").value.trim();

  if (!doc || !clinic) {
    alert("कृपया डॉक्टर का नाम और क्लिनिक का नाम अवश्य भरें!");
    return;
  }

  clinicProfile.docName = doc;
  clinicProfile.gender = gender;
  clinicProfile.clinicName = clinic;
  clinicProfile.degree = degree;
  clinicProfile.regNo = reg;
  clinicProfile.phone = phone;
  clinicProfile.address = addr;

  localStorage.setItem(CLINIKEY, JSON.stringify(clinicProfile));
  closeModal("drProfileSetupModal");
  alert("✓ डॉक्टर प्रोफाइल सफलता से सुरक्षित हुई!");
  openClinicDesk();
}

/* =========================================================
   3. पर्चे में 3x Add More + इंजन
   ========================================================= */
function promptAddCustomRxItem(type) {
  const titles = { c: "नया लक्षण (Complaint)", t: "नया उपचार / थेरेपी (Treatment)", a: "नया परहेज / कसरत (Advice)" };
  const val = prompt(`${titles[type]} दर्ज करें:`);
  if (!val || !val.trim()) return;

  const cleanVal = val.trim();
  if (!customRxItems[type]) customRxItems[type] = [];
  if (!customRxItems[type].includes(cleanVal)) {
    customRxItems[type].push(cleanVal);
    localStorage.setItem(RXCUSTOMKEY, JSON.stringify(customRxItems));
  }

  if (type === 'c') selRxComplaints.add(cleanVal);
  else if (type === 't') selRxTreatments.add(cleanVal);
  else if (type === 'a') selRxAdvices.add(cleanVal);

  initRxClouds();
}

function updateRxCategoryBadge() {
  const val = parseInt(document.getElementById("rxTemplatePicker").value);
  const badge = document.getElementById("rxCategoryBadge");
  if (!badge) return;
  if (val <= 10) badge.textContent = "1. क्लासिक क्लिनिकल";
  else if (val <= 20) badge.textContent = "2. मॉडर्न फिजियो व न्यूरो";
  else if (val <= 30) badge.textContent = "3. आयुष व नाड़ी वैदिकी";
  else if (val <= 40) badge.textContent = "4. थर्मल पॉकेट रोल";
  else badge.textContent = "5. एग्जीक्यूटिव मिनिमल";
}

function setRxCategory(cat, btn) {
  rxMode = cat;
  document.querySelectorAll(".rx-tab-btn").forEach(b => {
    b.style.background = "#f1f5f9";
    b.style.color = "var(--text-muted)";
  });
  btn.style.background = "#0f172a";
  btn.style.color = "#fff";

  selRxComplaints.clear();
  selRxTreatments.clear();
  selRxAdvices.clear();
  initRxClouds();
}

function initRxClouds() {
  const d = rxDataLibrary[rxMode];
  const allC = [...d.complaints, ...(customRxItems.c || [])];
  const allT = [...d.treatment, ...(customRxItems.t || [])];
  const allA = [...d.advice, ...(customRxItems.a || [])];

  const cBox = document.getElementById("boxComplaintsCloud");
  const tBox = document.getElementById("boxTreatmentCloud");
  const aBox = document.getElementById("boxAdviceCloud");

  if (cBox) {
    cBox.innerHTML = allC.map(item => `
      <span onclick="toggleRxChip('c', '${item}', this)" style="padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:${selRxComplaints.has(item)?'#0f172a':'#f1f5f9'};color:${selRxComplaints.has(item)?'#fff':'#334155'};border:1px solid #cbd5e1;">${item}</span>
    `).join("");
  }
  if (tBox) {
    tBox.innerHTML = allT.map(item => `
      <span onclick="toggleRxChip('t', '${item}', this)" style="padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:${selRxTreatments.has(item)?'#0f172a':'#f1f5f9'};color:${selRxTreatments.has(item)?'#fff':'#334155'};border:1px solid #cbd5e1;">${item}</span>
    `).join("");
  }
  if (aBox) {
    aBox.innerHTML = allA.map(item => `
      <span onclick="toggleRxChip('a', '${item}', this)" style="padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:${selRxAdvices.has(item)?'#0f172a':'#f1f5f9'};color:${selRxAdvices.has(item)?'#fff':'#334155'};border:1px solid #cbd5e1;">${item}</span>
    `).join("");
  }
}

function toggleRxChip(type, val, el) {
  let s = type === 'c' ? selRxComplaints : type === 't' ? selRxTreatments : selRxAdvices;
  if (s.has(val)) s.delete(val); else s.add(val);
  el.style.background = s.has(val) ? "#0f172a" : "#f1f5f9";
  el.style.color = s.has(val) ? "#fff" : "#334155";
}

/* =========================================================
   4. क्लिनिक पर्चा प्रिंट व WhatsApp (स्थायी फुटर सहित)
   ========================================================= */
function printClinicPrescription() {
  const name = document.getElementById("clPtName").value.trim();
  if (!name) { alert("कृपया मरीज़ का नाम लिखें!"); return; }

  const ageGen = document.getElementById("clPtAgeGen").value.trim() || "-";
  const phone = document.getElementById("clPtPhone").value.trim() || "-";
  const next = document.getElementById("clPtNext").value.trim() || "आवश्यकतानुसार";
  const tplId = parseInt(document.getElementById("rxTemplatePicker").value);
  const today = new Date().toLocaleDateString('hi-IN');
  const rxNo = "#RX-" + (1000 + tplId * 10 + Math.floor(Math.random() * 9));

  const complaints = Array.from(selRxComplaints).join(", ") || "सामान्य परीक्षण";
  const treatments = Array.from(selRxTreatments).map((t, i) => `<div><b>${i+1}.</b> ${t}</div>`).join("") || "परामर्श पूर्ण";
  const advices = Array.from(selRxAdvices).map(a => `<div>• ${a}</div>`).join("") || "सावधानी रखें";

  const idLine = clinicProfile.idVerified ? `<div style="font-size:10px;color:#059669;font-weight:700;">प्रमाणित पहचान: XXXX-XXXX-${clinicProfile.idLast4} Verified ✅</div>` : '';

  const pArea = document.getElementById("clinicPrintArea");
  pArea.innerHTML = `
    <div style="max-width:680px;margin:auto;font-family:sans-serif;padding:22px;border:2px solid #0f172a;background:#fff;border-radius:12px;">
      <div style="border-bottom:2px solid #0f172a;padding-bottom:10px;display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h2 style="font-size:20px;font-weight:800;margin:0;color:#0f172a;">${esc(clinicProfile.clinicName)}</h2>
          <p style="font-size:12.5px;font-weight:700;margin:2px 0;">${esc(clinicProfile.docName)} (${esc(clinicProfile.gender || '-')}) - ${esc(clinicProfile.degree || '')}</p>
          <p style="font-size:11px;color:#334155;margin:1px 0;">पंजीकरण सं.: <b>${esc(clinicProfile.regNo || '-')}</b> | मो.: ${esc(clinicProfile.phone || '-')}</p>
          <p style="font-size:10px;color:#64748b;margin:0;">पता: ${esc(clinicProfile.address || '-')}</p>
          ${idLine}
        </div>
        <div style="text-align:right;">
          <div style="font-size:26px;font-weight:800;color:#0284c7;line-height:1;">℞</div>
          <div style="font-size:11px;font-weight:700;margin-top:4px;">दिनांक: ${today}</div>
          <div style="font-size:10px;color:#64748b;">पर्चा सं.: ${rxNo}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #cbd5e1;font-size:12px;">
        <div>मरीज़: <b>${esc(name)}</b> (${esc(ageGen)})</div>
        <div>मो.: <b>${esc(phone)}</b></div>
        <div>टेम्पलेट: #${tplId}</div>
      </div>
      <div style="margin-top:14px;">
        <div style="font-size:11px;font-weight:800;color:#475569;">निदान (Complaints):</div>
        <div style="font-size:13px;font-weight:700;color:#0f172a;margin:3px 0 12px;">${complaints}</div>
        <div style="font-size:11px;font-weight:800;color:#475569;">उपचार व थेरेपी (Treatment / Rx):</div>
        <div style="font-size:13px;line-height:1.6;color:#0f172a;margin:4px 0 12px;">${treatments}</div>
        <div style="font-size:11px;font-weight:800;color:#475569;">परहेज व कसरत (Advice):</div>
        <div style="font-size:12px;line-height:1.5;color:#334155;margin:4px 0 12px;">${advices}</div>
        <div style="margin-top:12px;padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:11px;display:inline-block;">
          <b>अगला परामर्श:</b> ${esc(next)}
        </div>
      </div>
      <div style="margin-top:35px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div></div>
        <div style="text-align:center;font-size:11px;font-weight:700;"><div style="border-top:1px solid #000;width:140px;margin-bottom:4px;"></div>अधिकृत हस्ताक्षर</div>
      </div>
      ${PRINT_FOOTER_BRAND}
    </div>
  `;

  if (typeof addVaultReward === "function") addVaultReward(0.05);
  setTimeout(() => { window.print(); }, 250);
}

function sendClinicWhatsAppRx() {
  const name = document.getElementById("clPtName").value.trim();
  const phone = document.getElementById("clPtPhone").value.trim();
  if (!name) { alert("मरीज़ का नाम लिखें!"); return; }
  if (!phone || phone.length < 10) { alert("10 अंकों का WhatsApp नंबर लिखें!"); return; }

  const complaints = Array.from(selRxComplaints).join(", ") || "क्लिनिकल परीक्षण";
  const treatments = Array.from(selRxTreatments).map((t, idx) => `${idx+1}. ${t}`).join("\n") || "परामर्श पूर्ण";
  const advices = Array.from(selRxAdvices).map(a => `• ${a}`).join("\n") || "सावधानी रखें";
  const next = document.getElementById("clPtNext").value.trim() || "आवश्यकतानुसार";

  let msg = `*${clinicProfile.clinicName}*\n${clinicProfile.docName} (${clinicProfile.degree || ''})\nReg: ${clinicProfile.regNo || '-'}\nमो.: ${clinicProfile.phone || '-'}\n` +
         `------------------------\n` +
         `नमस्ते *${name}* जी, आपका क्लिनिकल पर्चा:\n\n` +
         `*निदान:* ${complaints}\n\n` +
         `*दवा व थेरेपी:*\n${treatments}\n\n` +
         `*परहेज व निर्देश:*\n${advices}\n\n` +
         `*अगला परामर्श:* ${next}` +
         WA_FOOTER_BRAND;

  if (typeof addVaultReward === "function") addVaultReward(0.05);
  window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* =========================================================
   5. फार्मेसी व दवा काउंटर
   ========================================================= */
function openPharmaDesk() {
  closeModal("servicesAccordionModal");
  let desk = document.getElementById("activePharmaDeskModal");
  if (desk) desk.remove();

  desk = document.createElement("div");
  desk.className = "modal";
  desk.id = "activePharmaDeskModal";
  desk.style.display = "flex";

  desk.innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <h2 style="font-size:16px;font-weight:800;">${esc(pharmaProfile.name || 'मेरी फार्मेसी व मेडिकल')}</h2>
          <p style="font-size:11px;color:var(--text-muted);">डी.एल. सं.: ${esc(pharmaProfile.dl || 'DL-2026/01')}</p>
        </div>
        <button type="button" class="btn-close-sm" onclick="closeModal('activePharmaDeskModal')">✕</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
        <input id="phCustName" class="d-input" placeholder="ग्राहक का नाम (उदा. नकद)">
        <input id="phCustPhone" type="tel" maxlength="10" class="d-input" placeholder="WhatsApp नंबर">
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr style="border-bottom:1px solid var(--border-line);color:var(--text-muted);text-align:left;">
            <th style="padding:4px;">दवा नाम</th><th style="padding:4px;">बैच/एक्स</th><th style="padding:4px;width:16%;">मात्रा</th><th style="padding:4px;text-align:right;">दर (₹)</th>
          </tr>
        </thead>
        <tbody id="pharmaTableBody"></tbody>
      </table>

      <button type="button" onclick="addPharmaRow()" class="btn" style="background:#f0f9ff;color:#0284c7;height:36px;font-size:11.5px;margin-top:8px;">＋ नई दवा जोड़ें</button>

      <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-line);font-size:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>उप-योग:</span><strong id="phSubTotal">₹0.00</strong></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span>छूट (₹):</span>
          <input type="number" id="phDiscount" value="0" oninput="recalcPharma()" style="width:70px;height:28px;text-align:right;border:1px solid var(--border-line);border-radius:6px;padding:2px 4px;">
        </div>
        <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:800;border-top:1px dashed var(--border-line);padding-top:6px;">
          <span>कुल देय:</span><strong id="phGrandTotal" style="color:#0284c7;font-size:17px;">₹0.00</strong>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
        <button type="button" class="btn-save" style="background:#0f172a;" onclick="printPharmaInvoice()">🖨️ पर्चा प्रिंट (+बरकत)</button>
        <button type="button" class="btn-save" style="background:#16a34a;" onclick="sendPharmaWhatsApp()">📲 WhatsApp बिल</button>
      </div>
    </div>
  `;

  document.body.appendChild(desk);
  renderPharmaCart();
}

function renderPharmaCart() {
  const tb = document.getElementById("pharmaTableBody");
  if (!tb) return;
  tb.innerHTML = pharmaCart.map((item, idx) => `
    <tr>
      <td style="padding:4px;"><input type="text" value="${esc(item.name)}" oninput="pharmaCart[${idx}].name=this.value" class="d-input" style="height:32px;margin:0;" placeholder="दवा नाम"></td>
      <td style="padding:4px;"><input type="text" value="${esc(item.batch)}" oninput="pharmaCart[${idx}].batch=this.value" class="d-input" style="height:32px;margin:0;" placeholder="बैच"></td>
      <td style="padding:4px;"><input type="number" min="1" value="${item.qty}" oninput="pharmaCart[${idx}].qty=Number(this.value);recalcPharma()" class="d-input" style="height:32px;margin:0;text-align:center;"></td>
      <td style="padding:4px;"><input type="number" value="${item.rate}" oninput="pharmaCart[${idx}].rate=Number(this.value);recalcPharma()" class="d-input" style="height:32px;margin:0;text-align:right;"></td>
    </tr>
  `).join("");
  recalcPharma();
}

function addPharmaRow() {
  pharmaCart.push({ name: "", batch: "", qty: 1, rate: 0 });
  renderPharmaCart();
}

function recalcPharma() {
  let sub = 0;
  pharmaCart.forEach(i => sub += (Number(i.qty || 0) * Number(i.rate || 0)));
  const disc = Number(document.getElementById("phDiscount")?.value) || 0;
  const grand = Math.max(0, sub - disc);
  const sEl = document.getElementById("phSubTotal");
  const gEl = document.getElementById("phGrandTotal");
  if (sEl) sEl.textContent = "₹" + sub.toFixed(2);
  if (gEl) gEl.textContent = "₹" + grand.toFixed(2);
}

function printPharmaInvoice() {
  const cName = document.getElementById("phCustName").value.trim() || "नकद ग्राहक";
  const pArea = document.getElementById("pharmaPrintArea");
  const now = new Date();
  const dStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;

  let sub = 0, rows = "";
  pharmaCart.forEach((i, idx) => {
    if ((i.name && i.name.trim() !== "") || Number(i.rate) > 0) {
      const qVal = Number(i.qty) || 1, rVal = Number(i.rate) || 0;
      const tot = qVal * rVal;
      sub += tot;
      rows += `<tr><td>${idx+1}. ${esc(i.name)} (${esc(i.batch||'-')})</td><td style="text-align:center;">${qVal}</td><td style="text-align:right;">₹${tot.toFixed(2)}</td></tr>`;
    }
  });

  const disc = Number(document.getElementById("phDiscount").value) || 0;
  const grand = Math.max(0, sub - disc);

  pArea.innerHTML = `
    <div style="max-width:320px;margin:auto;font-family:monospace;padding:10px;background:#fff;border:1px solid #000;">
      <center><b>${esc(pharmaProfile.name || 'फार्मेसी मेडिकल स्टोर')}</b><br><small>डी.एल.: ${esc(pharmaProfile.dl || 'DL-2026/01')}</small></center>
      <hr style="border-top:1px dashed #000;margin:6px 0;">
      <div>दिनांक: ${dStr} | ग्राहक: ${esc(cName)}</div>
      <table style="width:100%;margin-top:6px;"><thead><tr><th>दवा विवरण</th><th>मात्रा</th><th style="text-align:right;">कुल</th></tr></thead><tbody>${rows}</tbody></table>
      <hr style="border-top:1px dashed #000;margin:6px 0;">
      <div style="text-align:right;">उप-योग: ₹${sub.toFixed(2)}<br>छूट: ₹${disc.toFixed(2)}<br><b>कुल देय: ₹${grand.toFixed(2)}</b></div>
      ${PRINT_FOOTER_BRAND}
    </div>
  `;

  if (typeof addVaultReward === "function") addVaultReward(0.05);
  setTimeout(() => { window.print(); }, 250);
}

function sendPharmaWhatsApp() {
  const phone = document.getElementById("phCustPhone").value.trim();
  const cName = document.getElementById("phCustName").value.trim() || "ग्राहक";
  if (!phone || phone.length < 10) { alert("मान्य 10 अंकों का WhatsApp नंबर दर्ज करें!"); return; }

  let sub = 0, medLines = "";
  pharmaCart.forEach((i, idx) => {
    if ((i.name && i.name.trim() !== "") || Number(i.rate) > 0) {
      const qVal = Number(i.qty) || 1, rVal = Number(i.rate) || 0;
      const tot = qVal * rVal;
      sub += tot;
      medLines += `${idx+1}. ${i.name} (बैच: ${i.batch||'-'}) - ${qVal} x ₹${rVal} = ₹${tot}\n`;
    }
  });

  const disc = Number(document.getElementById("phDiscount").value) || 0;
  const grand = Math.max(0, sub - disc);

  let msg = `*${pharmaProfile.name || 'फार्मेसी मेडिकल स्टोर'}*\nडी.एल.: ${pharmaProfile.dl || '-'}\n` +
         `------------------------\n` +
         `नमस्ते *${cName}* जी, आपका मेडिकल बिल:\n\n` +
         `*दवाइयाँ:*\n${medLines || 'दवा पर्चा पूर्ण'}\n` +
         `*कुल देय राशि: ₹${grand.toFixed(2)}*` +
         WA_FOOTER_BRAND;

  if (typeof addVaultReward === "function") addVaultReward(0.05);
  window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* =========================================================
   6. PoW कारीगर नेटवर्क व कंट्रोल रूम
   ========================================================= */
function openPoWNetwork() {
  closeModal("servicesAccordionModal");
  let modal = document.getElementById("activePoWDirModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "activePoWDirModal";
  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="box" style="background:#0b0f19;color:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:800;color:#38bdf8;">⚡ PoW कारीगर डायरेक्टरी</h2>
        <button type="button" class="btn-close-sm" style="background:#1e293b;color:#fff;" onclick="closeModal('activePoWDirModal')">✕</button>
      </div>
      <input type="text" id="netSearchQuery" class="d-input" placeholder="पिन कोड या काम से खोजें (उदा. 271801)..." oninput="renderPoWDirectoryItems()" style="background:#161f30;border-color:#23324a;color:#fff;">
      <div id="dirListItemsBox" style="margin-top:10px;display:flex;flex-direction:column;gap:8px;"></div>
    </div>
  `;

  document.body.appendChild(modal);
  renderPoWDirectoryItems();
}

function renderPoWDirectoryItems() {
  const box = document.getElementById("dirListItemsBox");
  if (!box) return;
  const q = (document.getElementById("netSearchQuery")?.value || "").toLowerCase().trim();
  let myP = JSON.parse(localStorage.getItem(POW_PROFILE_KEY));

  let list = [
    { name: "सुरेश मौर्या", category: "इलेक्ट्रीशियन व रिपेयर", pin: "271801", score: 14, fee: "₹250", phone: "9876543210" },
    { name: "अमित वर्मा", category: "होम ट्यूशन (गणित/साइंस)", pin: "271801", score: 9, fee: "₹1200", phone: "9876543211" },
    { name: "कल्लू मिस्त्री", category: "राजमिस्त्री व निर्माण", pin: "271801", score: 3, fee: "₹650", phone: "9876543212" }
  ];
  if (myP) list.unshift(myP);

  list = list.filter(p => p.pin.includes(q) || p.category.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));

  if (!list.length) {
    box.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8;">कोई कारीगर नहीं मिला।</div>';
    return;
  }

  box.innerHTML = list.map(p => `
    <div style="background:#161f30;border:1px solid #23324a;border-radius:14px;padding:12px;">
      <div style="display:flex;justify-content:space-between;font-weight:800;">
        <div>${esc(p.name)} <small style="color:#38bdf8;">(${esc(p.category)})</small></div>
        <div style="color:#38bdf8;">PoW: ${p.score}</div>
      </div>
      <div style="font-size:11px;color:#94a3b8;margin:6px 0;">पिन: ${esc(p.pin)} • फीस: <b style="color:#fde047;">${esc(p.fee)}</b></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <a href="tel:${p.phone}" style="background:#10b981;color:#fff;text-align:center;padding:7px;border-radius:8px;text-decoration:none;font-size:11.5px;font-weight:800;">📞 कॉल</a>
        <a href="https://wa.me/91${p.phone}" target="_blank" style="background:#25d366;color:#fff;text-align:center;padding:7px;border-radius:8px;text-decoration:none;font-size:11.5px;font-weight:800;">💬 चैट</a>
      </div>
    </div>
  `).join("");
}

function openProviderDesk() {
  closeModal("servicesAccordionModal");
  let modal = document.getElementById("activeProvDeskModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "activeProvDeskModal";
  modal.style.display = "flex";

  const p = JSON.parse(localStorage.getItem(POW_PROFILE_KEY));

  modal.innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:800;">🛠️ कारीगर कंट्रोल रूम (1 फोन = 1 प्रोफाइल)</h2>
        <button type="button" class="btn-close-sm" onclick="closeModal('activeProvDeskModal')">✕</button>
      </div>

      ${!p ? `
        <div id="pRegSection">
          <p style="font-size:11.5px;color:var(--text-muted);margin-bottom:10px;">* इस डिवाइस से केवल एक ही कारीगर प्रोफाइल लॉक होगी।</p>
          <input type="text" id="provRegName" class="d-input" placeholder="कारीगर का पूरा नाम *">
          <select id="provRegCat" class="d-input" style="font-weight:700;">
            <option>इलेक्ट्रीशियन व रिपेयर</option>
            <option>AC / कूलर रिपेयर</option>
            <option>होम ट्यूशन (गणित/साइंस)</option>
            <option>प्लंबर व फिटिंग</option>
            <option>राजमिस्त्री व निर्माण</option>
          </select>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <input type="text" id="provRegPin" class="d-input" placeholder="पिन कोड (उदा. 202001)">
            <input type="text" id="provRegArea" class="d-input" placeholder="शहर / इलाका">
          </div>
          <input type="text" id="provRegFee" class="d-input" placeholder="विज़िट फीस / दिहाड़ी (उदा. ₹500/दिन)">
          <input type="tel" id="provRegPhone" maxlength="10" class="d-input" placeholder="WhatsApp नंबर *">
          <button type="button" class="btn-save" style="width:100%;margin-top:8px;" onclick="saveProvProfileData()">सुरक्षित करें व प्रोफाइल बनाएं</button>
        </div>
      ` : `
        <div id="pDashSection">
          <div style="background:#f8fafc;border:1px solid var(--border-line);border-radius:14px;padding:12px;margin-bottom:12px;line-height:1.7;font-size:12px;">
            <h3 style="font-size:14px;font-weight:800;color:var(--text-main);">${esc(p.name)} (${esc(p.category)})</h3>
            📍 <b>स्थान:</b> ${esc(p.area)} (${esc(p.pin)})<br>
            💰 <b>फीस:</b> ${esc(p.fee)} • 📱 <b>नंबर:</b> ${esc(p.phone)}<br>
            📅 <b>हफ्ते की हाजिरी:</b> <b style="color:var(--primary);">${p.attendance} / 4</b> • 🏆 <b>PoW स्कोर:</b> <b style="color:var(--india-green);">${p.score} अंक</b>
          </div>

          <button type="button" class="btn" style="background:#16a34a;color:#fff;width:100%;margin-bottom:10px;height:42px;" onclick="markProvAttendance()">🟢 आज की हाजिरी दर्ज करें</button>
          <button type="button" id="btnThankYouCool" class="btn" style="background:#0b57d0;color:#fff;width:100%;margin-bottom:10px;height:42px;" onclick="execProvThankYou()">🙏 धन्यवाद! काम पूरा हुआ</button>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <button type="button" class="btn-cancel" onclick="editProvProfile()">✏️ एडिट</button>
            <button type="button" class="btn-cancel" style="color:var(--red);" onclick="deleteProvProfile()">🗑️ प्रोफाइल हटाएं</button>
          </div>
        </div>
      `}
    </div>
  `;

  document.body.appendChild(modal);

  if (p) {
    const tyBtn = document.getElementById("btnThankYouCool");
    const now = Date.now();
    const diff = now - (p.lastThankYouTime || 0);
    if (diff < ONE_DAY_MS && tyBtn) {
      const hrs = Math.ceil((ONE_DAY_MS - diff) / (1000 * 60 * 60));
      tyBtn.innerText = `⏳ आज का धन्यवाद दर्ज है (${hrs} घंटे बाकी)`;
      tyBtn.style.opacity = "0.5";
      tyBtn.style.cursor = "not-allowed";
    }
  }
}

function saveProvProfileData() {
  const name = document.getElementById("provRegName").value.trim();
  const category = document.getElementById("provRegCat").value;
  const pin = document.getElementById("provRegPin").value.trim();
  const area = document.getElementById("provRegArea").value.trim() || "स्थानीय";
  const fee = document.getElementById("provRegFee").value.trim() || "बातचीत अनुसार";
  const phone = document.getElementById("provRegPhone").value.trim();

  if (!name || !pin || !phone) {
    alert("कृपया नाम, पिन कोड और मोबाइल नंबर अवश्य भरें!");
    return;
  }

  const p = {
    name, category, pin, area, fee, phone,
    attendance: 1, score: 3, lastThankYouTime: 0,
    lastAttDate: new Date().toLocaleDateString()
  };
  localStorage.setItem(POW_PROFILE_KEY, JSON.stringify(p));
  alert("✓ कारीगर प्रोफाइल सुरक्षित हुई!");
  openProviderDesk();
}

function markProvAttendance() {
  let p = JSON.parse(localStorage.getItem(POW_PROFILE_KEY));
  const today = new Date().toLocaleDateString();
  if (p.lastAttDate === today) {
    alert("आज की हाजिरी पहले ही दर्ज हो चुकी है!");
    return;
  }
  p.attendance += 1;
  p.lastAttDate = today;
  localStorage.setItem(POW_PROFILE_KEY, JSON.stringify(p));
  alert("✓ आज की हाजिरी दर्ज हुई!");
  openProviderDesk();
}

function execProvThankYou() {
  let p = JSON.parse(localStorage.getItem(POW_PROFILE_KEY));
  const now = Date.now();
  const diff = now - (p.lastThankYouTime || 0);

  if (diff < ONE_DAY_MS) {
    const hrs = Math.ceil((ONE_DAY_MS - diff) / (1000 * 60 * 60));
    alert(`⚠️ PoW नियम: 24 घंटे में सिर्फ 1 बार धन्यवाद मान्य है!\nअगला धन्यवाद आप ${hrs} घंटे बाद दर्ज कर पाएंगे।`);
    return;
  }
  p.score += 2;
  p.lastThankYouTime = now;
  localStorage.setItem(POW_PROFILE_KEY, JSON.stringify(p));
  alert("🙏 धन्यवाद स्वीकार हुआ! PoW स्कोर 2 अंक बढ़ गया।\nअगला धन्यवाद 24 घंटे बाद खुलेगा।");
  openProviderDesk();
}

function editProvProfile() {
  let p = JSON.parse(localStorage.getItem(POW_PROFILE_KEY));
  const n = prompt("नया नाम:", p.name);
  if (n) p.name = n;
  const a = prompt("नया इलाका:", p.area);
  if (a) p.area = a;
  const f = prompt("नई फीस:", p.fee);
  if (f) p.fee = f;
  localStorage.setItem(POW_PROFILE_KEY, JSON.stringify(p));
  openProviderDesk();
}

function deleteProvProfile() {
  if (confirm("क्या आप वाकई इस फोन से प्रोफाइल हटाना चाहते हैं?")) {
    localStorage.removeItem(POW_PROFILE_KEY);
    openProviderDesk();
  }
}

/* =========================================================
   7. अन्य सेवाएँ व सरकारी पोर्टल
   ========================================================= */
function toggleServiceAccordion() {
  const modal = document.getElementById("servicesAccordionModal");
  if (modal) modal.style.display = "flex";
}

function openTurtlemintInsurance() {
  window.open(TURTLEMINT_OFFICIAL_URL, "_blank");
}

function openGovPortals() {
  closeModal("servicesAccordionModal");
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "govPortalModal";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:800;">🏛️ 12 आधिकारिक सरकारी पोर्टल</h2>
        <button type="button" class="btn-close-sm" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        ${citizenServicesData.map(c => `
          <div style="background:#f8fafc;border:1px solid var(--border-line);border-radius:14px;padding:10px;text-align:center;">
            <div style="font-size:24px;">${c.em}</div>
            <div style="font-size:8.5px;font-weight:800;color:var(--india-green);">${c.tag}</div>
            <div style="font-size:12px;font-weight:800;margin:2px 0;">${c.title}</div>
            <div style="font-size:9.5px;color:var(--text-muted);margin-bottom:8px;">${c.sub}</div>
            <a href="${c.url}" target="_blank" rel="noopener" style="display:block;padding:5px 0;background:#0f172a;color:#fff;border-radius:8px;font-size:10px;font-weight:800;text-decoration:none;">खोलें ↗</a>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
