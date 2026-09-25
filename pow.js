// ==========================================================================
// चुपाकाबरा नेटवर्क - मास्टर कंट्रोलर (pow.js)
// सम्पूर्ण ओरिजिनल फीचर्स: बरकत (40 बिल = 2.0), PoW प्रोफाइल फ़ॉर्म, 
// 12 सरकारी पोर्टल, टर्टलमिंट, क्लिनिक 50 Rx, मुंशी जी चाय/कुटाई
// ==========================================================================

const CHUPA_APP_CONFIG = {
  // 1. लाइव एड्स और एनीमेशन स्टेज (ऑडियो वॉल्यूम के साथ)
  adStage: {
    intervalMs: 8000,
    items: [
      {
        id: "ad_chupa_soap",
        icon: "🧼",
        title: "चुपाकाबरा प्राकृतिक सोप्स",
        tagline: "नीम, संतरा छिलका व ग्लिसरीन बेस",
        cta: "ऑर्डर करें ➔",
        particleColor: "#10b981",
        audioTone: 440
      },
      {
        id: "ad_clinic",
        icon: "🩺",
        title: "RP Physio & Wellness",
        tagline: "फिजियोथेरेपी व न्यूरो असेसमेंट क्लिनिक",
        cta: "पर्चा बनाएं ➔",
        particleColor: "#38bdf8",
        audioTone: 554
      },
      {
        id: "ad_chai",
        icon: "☕",
        title: "मुंशी जी चाय व कुटाई डेस्क",
        tagline: "उधारी वसूली • चाय पर पंचायत व समझौता",
        cta: "हिसाब देखें ➔",
        particleColor: "#fde047",
        audioTone: 659
      }
    ]
  },

  // 2. त्वरित एक्शन बटन्स
  quickActions: [
    { label: "QR स्कैन", icon: "📷", action: "scan" },
    { label: "भुगतान", icon: "💸", action: "pay" },
    { label: "बैंक ट्रांसफर", icon: "🏛️", action: "bank" },
    { label: "रिचार्ज", icon: "📱", action: "recharge" }
  ],

  // 3. गद्दी संतुलन
  gaddi: {
    netVal: "+ ₹580",
    lendAmt: "₹580",
    dueAmt: "₹0"
  },

  // 4. ग्राहक बहीखाता (उधार, जमा, चाय, कुटाई)
  customers: [
    { id: "c1", name: "राम कुमार", phone: "9876500001", amt: "₹450", isDue: true, color: "#1d4ed8", chaiCount: 3, kutaiWarning: "1st नोटिस भेजा" },
    { id: "c2", name: "मुकेश मेडिकल", phone: "9876500002", amt: "₹130", isDue: true, color: "#047857", chaiCount: 1, kutaiWarning: "सामान्य" },
    { id: "c3", name: "सन्नो किराना", phone: "9876500003", amt: "₹0", isDue: false, color: "#b45309", chaiCount: 5, kutaiWarning: "क्लियर खाता" }
  ],

  // 5. सेवाएँ ग्रिड (सभी 8 मुख्य पोर्टल)
  services: [
    { id: "pow_network", name: "PoW नेटवर्क", icon: "⚡", bg: "#e0f2fe" },
    { id: "clinic_50rx", name: "क्लिनिक 50 Rx", icon: "🩺" },
    { id: "pharma_desk", name: "दवा काउंटर", icon: "💊" },
    { id: "turtlemint", name: "टर्टलमिंट बीमा", icon: "🛡️" },
    { id: "mandi_rates", name: "मंडी भाव", icon: "🌾" },
    { id: "gov_portals", name: "12 सरकारी", icon: "🏛️" },
    { id: "business_loan", name: "व्यापार लोन", icon: "💰" },
    { id: "munshi_ai", name: "मुंशी जी (कुटाई)", icon: "☕" }
  ],

  // 6. 12 सरकारी पोर्टल सूची
  govServices: [
    { name: "UPSSSC परीक्षा पोर्टल", link: "http://upsssc.gov.in" },
    { name: "ई-डिस्ट्रिक्ट यूपी (जाति/आय/निवास)", link: "https://edistrict.up.gov.in" },
    { name: "भूलेख खतौनी उत्तर प्रदेश", link: "http://upbhulekh.gov.in" },
    { name: "पीएम किसान सम्मान निधि", link: "https://pmkisan.gov.in" },
    { name: "राशन कार्ड पात्रता सूची (FCS UP)", link: "https://fcs.up.gov.in" },
    { name: "आधार सेवा केंद्र पोर्टल", link: "https://myaadhaar.uidai.gov.in" },
    { name: "यूपी बिजली बिल भुगतान (UPPCL)", link: "https://www.upenergy.in" },
    { name: "वाहन व सारथी ड्राइविंग लाइसेंस", link: "https://parivahan.gov.in" },
    { name: "श्रम कार्ड (e-Shram)", link: "https://eshram.gov.in" },
    { name: "पेंशन पोर्टल (वृद्धा/विधवा)", link: "https://sspy-up.gov.in" },
    { name: "जनसुनवाई समाधान यूपी", link: "https://jansunwai.up.gov.in" },
    { name: "आयुष्मान भारत कार्ड", link: "https://beneficiary.nha.gov.in" }
  ],

  // 7. मंडी भाव
  mandiData: [
    { item: "गेहूँ (शरबती)", rate: "₹2,650 / कुंतल", mandi: "बहराइच मंडी", change: "+₹30" },
    { item: "सरसों (काली)", rate: "₹5,400 / कुंतल", mandi: "बहराइच मंडी", change: "-₹20" },
    { item: "धान (बासमती)", rate: "₹3,800 / कुंतल", mandi: "बहराइच मंडी", change: "+₹50" }
  ],

  // 8. बॉटम डॉक
  dockNav: [
    { id: "home", label: "होम", icon: "🏠" },
    { id: "pow_network", label: "नेटवर्क", icon: "⚡" },
    { id: "scan", label: "स्कैन", icon: "📷", isCenter: true },
    { id: "ledger", label: "बहीखाता", icon: "📒" },
    { id: "provider", label: "प्रोवाइडर", icon: "🛠️" }
  ]
};

// ==========================================================================
// इंजन निष्पादन कोर
// ==========================================================================
(function () {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let currentAdIdx = 0;
  let audioCtx = null;
  let isSoundActive = false;

  // बरकत पॉइंट इंजन: 0.05 पॉइंट प्रति बिल | 40 बिल = 2.0 अधिकतम दैनिक सीमा
  function getBarkatData() {
    const today = new Date().toLocaleDateString();
    let data = JSON.parse(localStorage.getItem('chupa_barkat_ledger')) || {
      date: today,
      todayBills: 0,
      todayPoints: 0.0,
      totalVault: 0.25
    };
    if (data.date !== today) {
      data.date = today;
      data.todayBills = 0;
      data.todayPoints = 0.0;
    }
    return data;
  }

  function saveBarkatData(data) {
    localStorage.setItem('chupa_barkat_ledger', JSON.stringify(data));
  }

  function playAdTone(freq) {
    if (!isSoundActive) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq || 440;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  }

  // Canvas लाइव एनीमेशन
  let canvas, ctx, particles = [];
  function initLiveCanvasAnimation() {
    canvas = document.getElementById("adCanvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const curColor = CHUPA_APP_CONFIG.adStage.items[currentAdIdx].particleColor || "#38bdf8";

      ctx.fillStyle = curColor;
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  function updateAdStageUI() {
    const overlay = document.getElementById("adOverlayContent");
    if (!overlay) return;
    const ad = CHUPA_APP_CONFIG.adStage.items[currentAdIdx];

    overlay.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="font-size:36px; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5));">${ad.icon}</div>
        <div>
          <div style="font-size:14px; font-weight:800; color:#fff;">${ad.title}</div>
          <div style="font-size:11px; opacity:0.9; color:#f1f5f9; margin-top:2px;">${ad.tagline}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <button id="btnSoundToggle" style="background:rgba(255,255,255,0.25); border:none; color:#fff; border-radius:50%; width:32px; height:32px; cursor:pointer; font-size:14px; margin-bottom:6px;">${isSoundActive ? '🔊' : '🔇'}</button>
        <div onclick="window.powApp.switchScreen('${ad.id === 'ad_clinic' ? 'clinic_50rx' : (ad.id === 'ad_chai' ? 'munshi_ai' : 'home')}', '${ad.title}')" style="font-size:11px; font-weight:800; color:#fff; background:rgba(0,0,0,0.5); padding:5px 12px; border-radius:14px; cursor:pointer; border:1px solid rgba(255,255,255,0.3);">${ad.cta}</div>
      </div>
    `;

    document.getElementById("btnSoundToggle").onclick = function (e) {
      e.stopPropagation();
      isSoundActive = !isSoundActive;
      this.innerText = isSoundActive ? '🔊' : '🔇';
      if (isSoundActive) playAdTone(ad.audioTone);
    };

    if (isSoundActive) playAdTone(ad.audioTone);
  }

  // विंडो API
  window.powApp = {
    switchScreen: function (screenId, title = "") {
      document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));

      const dockBtn = document.getElementById("dock_" + screenId);
      if (dockBtn) dockBtn.classList.add('active');

      if (screenId === "home") {
        document.getElementById("viewHome").classList.add('active');
      } else {
        document.getElementById("viewDynamicModule").classList.add('active');
        document.getElementById("dynamicModuleTitle").innerText = title || screenId.toUpperCase();
        this.renderModule(screenId);
      }
      window.scrollTo(0, 0);
    },

    renderModule: function (id) {
      const container = document.getElementById("dynamicModuleContent");

      // 1. टर्टलमिंट आधिकारिक पार्टनर पोर्टल
      if (id === "turtlemint") {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:20px; padding:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div>
                <h3 style="color:#0284c7; font-size:16px;">🛡️ Turtlemint Insurance Hub</h3>
                <small style="color:#64748b;">प्रमाणित PoSP बीमा सलाहकार डेस्क</small>
              </div>
              <span style="font-size:28px;">📄</span>
            </div>
            <p style="font-size:12px; color:#475569; margin-bottom:14px;">लाइफ, हेल्थ व जनरल इंश्योरेंस कोटेशन व पॉलिसी जारी करें:</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
              <button class="btn-std" style="background:#0284c7; color:#fff;" onclick="window.open('https://www.turtlemint.com', '_blank')">🌐 आधिकारिक पोर्टल खोलें</button>
              <button class="btn-std" style="background:#16a34a; color:#fff;" onclick="alert('बीमा कोटेशन WhatsApp पर तैयार!')">📲 कोटेशन WhatsApp</button>
            </div>
          </div>
        `;
      }
      // 2. 12 सरकारी पोर्टल सूची
      else if (id === "gov_portals") {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:20px; padding:18px;">
            <h3 style="color:var(--g-primary-blue); font-size:16px; margin-bottom:6px;">🏛️ 12 आधिकारिक सरकारी पोर्टल</h3>
            <p style="font-size:11.5px; color:#64748b; margin-bottom:14px;">सीधे सरकारी सर्वर से जुड़े आधिकारिक लिंक:</p>
            <div style="display:grid; grid-template-columns:1fr; gap:8px;">
              ${CHUPA_APP_CONFIG.govServices.map(g => `
                <a href="${g.link}" target="_blank" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8fafd; border:1px solid #e0e2ec; border-radius:12px; text-decoration:none; color:#1f1f1f; font-size:13px; font-weight:700;">
                  <span>${g.name}</span>
                  <span style="color:var(--g-primary-blue);">खोलें ↗</span>
                </a>
              `).join('')}
            </div>
          </div>
        `;
      }
      // 3. मुंशी जी (चाय व कुटाई डेस्क)
      else if (id === "munshi_ai") {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:20px; padding:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div>
                <h3 style="color:#b45309; font-size:16px;">☕ मुंशी जी - चाय व कुटाई पंचायत</h3>
                <small style="color:#64748b;">उधारी वसूली और पंचायत डेस्क</small>
              </div>
              <span style="font-size:28px;">⚖️</span>
            </div>
            <div style="background:#fef3c7; border:1px solid #fde68a; padding:12px; border-radius:14px; margin-bottom:14px; font-size:12px; line-height:1.5; color:#92400e;">
              <b>मुंशी जी का नियम:</b> "पहले प्रेम से चाय पिलाओ, फिर हिसाब समझाओ। अगर फिर भी टरकाए... तब कुटाई (कड़क तकादा) शुरू!"
            </div>
            <div style="font-size:13px; font-weight:800; margin-bottom:8px;">बकायादार सूची:</div>
            ${CHUPA_APP_CONFIG.customers.filter(c => c.isDue).map(c => `
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <b>${c.name}</b> (${c.amt})<br>
                  <small style="color:#64748b;">☕ चाय: ${c.chaiCount} बार • स्थिति: ${c.kutaiWarning}</small>
                </div>
                <div style="display:flex; gap:6px;">
                  <button onclick="window.powApp.serveChai('${c.id}')" style="background:#fef3c7; border:1px solid #b45309; color:#b45309; padding:6px 10px; border-radius:8px; font-weight:800; font-size:11px; cursor:pointer;">☕ चाय</button>
                  <button onclick="window.powApp.startKutai('${c.id}')" style="background:#fee2e2; border:1px solid #ef4444; color:#ef4444; padding:6px 10px; border-radius:8px; font-weight:800; font-size:11px; cursor:pointer;">🥊 कुटाई</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      // 4. बहीखाता
      else if (id === "ledger") {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:20px; padding:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
              <h3 style="color:var(--g-primary-blue); font-size:16px;">📒 डिजिटल ग्राहक बहीखाता</h3>
              <button onclick="window.powApp.addNewCustomer()" style="background:var(--g-light-blue); color:var(--g-primary-blue); border:none; padding:6px 12px; border-radius:12px; font-weight:800; font-size:11.5px; cursor:pointer;">＋ नया ग्राहक</button>
            </div>
            ${CHUPA_APP_CONFIG.customers.map(c => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="width:42px; height:42px; border-radius:50%; background:${c.color}; color:#fff; display:grid; place-items:center; font-weight:800;">${c.name[0]}</div>
                  <div>
                    <div style="font-size:13px; font-weight:700;">${c.name}</div>
                    <small style="color:#64748b;">📱 ${c.phone}</small>
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:14px; font-weight:800; color:${c.isDue ? '#b3261e' : '#146c2e'};">${c.amt}</div>
                  <small style="color:#64748b;">${c.isDue ? 'लेना बाकी' : 'हिसाब चुकता'}</small>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      // 5. सेटिंग्स (बरकत हिसाब)
      else if (id === "settings") {
        const b = getBarkatData();
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:20px; padding:18px;">
            <h3 style="color:var(--g-primary-blue); font-size:16px; margin-bottom:14px;">⚙️ ऐप व बरकत सेटिंग्स</h3>
            <div style="background:#f8fafd; border:1px solid #e2e8f0; border-radius:14px; padding:12px; margin-bottom:14px; font-size:12.5px; line-height:1.8;">
              👤 <b>प्रोपराइटर:</b> रवि कुमार<br>
              🪙 <b>बरकत वॉल्ट:</b> ${b.totalVault.toFixed(2)} पॉइंट सुरक्षित<br>
              📊 <b>आज के बिल:</b> ${b.todayBills} / 40 बिल<br>
              🎯 <b>आज की बरकत कमाई:</b> ${b.todayPoints.toFixed(2)} / 2.0 अधिकतम
            </div>
            <p style="font-size:11px; color:#64748b; margin-bottom:14px;">* नियम: प्रत्येक बिल पर 0.05 बरकत पॉइंट मिलते हैं। 40 बिल पूरे होने पर दैनिक सीमा 2.0 लॉक हो जाती है।</p>
            <button class="btn-std" style="background:#ef4444; color:#fff;" onclick="if(confirm('पूरा कैश और डेटा रीसेट करें?')) { localStorage.clear(); location.reload(); }">⚠️ पूरा कैश रीसेट करें</button>
          </div>
        `;
      }
      // 6. क्लिनिक 50 Rx
      else if (id === "clinic_50rx") {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:20px; padding:18px;">
            <div style="border-bottom:2px solid var(--g-primary-blue); padding-bottom:8px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <h3 style="color:var(--g-primary-blue); font-size:16px;">RP Physio & Wellness Clinic</h3>
                <small style="color:#64748b;">पर्चा एवं थेरेपी कंसल्टेशन डेस्क</small>
              </div>
              <span style="font-size:24px;">🩺</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
              <input type="text" id="rxPatientName" class="u-input" placeholder="मरीज़ का नाम" value="राकेश कुमार">
              <input type="number" id="rxAge" class="u-input" placeholder="उम्र" value="38">
            </div>
            <label style="font-size:11px; font-weight:700; color:var(--g-text-sub); display:block; margin-bottom:4px;">क्लिनिकल टेम्पलेट (50 Rx):</label>
            <select id="rxTemplateSelect" class="u-input" onchange="window.powApp.applyRxTemplate()" style="font-weight:700; color:var(--g-primary-blue);">
              <option value="1">📄 1. कमर दर्द / सायटिका</option>
              <option value="2">📄 2. गर्दन दर्द / सर्वाइकल स्पोंडिलाइटिस</option>
              <option value="3">📄 3. फ्रोजन शोल्डर एवं कपिंग थेरेपी</option>
              <option value="4">📄 4. घुटने का दर्द (Osteoarthritis Knee)</option>
              <option value="5">📄 5. सामान्य ओपीडी परामर्श</option>
            </select>
            <div class="form-group">
              <textarea id="rxDetails" class="u-input" style="height:80px; padding:8px; font-size:12px;">1. IFT + US थेरेपी (15 मिनट)\n2. कोर स्ट्रेचिंग व हॉट फर्मेंटेशन\n3. भारी वजन उठाने से परहेज</textarea>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <button class="btn-std" style="background:#0f172a; color:#fff;" onclick="window.powApp.generateRxBill()">🖨️ बिल काटें (+बरकत)</button>
              <button class="btn-std" style="background:#16a34a; color:#fff;" onclick="alert('पर्चा WhatsApp पर भेजा गया!')">📲 WhatsApp रसीद</button>
            </div>
          </div>
        `;
      }
      // 7. मंडी भाव
      else if (id === "mandi_rates") {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:18px; padding:16px;">
            <h3 style="font-size:16px; color:#146c2e; margin-bottom:12px;">🌾 आज का ताज़ा मंडी भाव</h3>
            ${CHUPA_APP_CONFIG.mandiData.map(m => `
              <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
                <div><b>${m.item}</b><br><small style="color:#666;">${m.mandi}</small></div>
                <div style="text-align:right;"><b style="color:#146c2e;">${m.rate}</b><br><small style="color:${m.change.includes('+')?'green':'red'}; font-weight:700;">${m.change}</small></div>
              </div>
            `).join('')}
          </div>
        `;
      }
      // 8. PoW सर्विस डायरेक्टरी
      else if (id === "pow_network") {
        container.innerHTML = `
          <div style="background:#0b0f19; color:#fff; border-radius:18px; padding:16px;">
            <h3 style="font-size:16px; color:#38bdf8; margin-bottom:6px;">⚡ PoW कारीगर डायरेक्टरी</h3>
            <p style="font-size:11.5px; color:#94a3b8; margin-bottom:12px;">4/4 हाज़िरी सत्यापित व 24h धन्यवाद स्कोर वाले कारीगर</p>
            <div id="powInnerDirectory"></div>
          </div>
        `;
        renderDirectoryList();
      }
      // 9. प्रोवाइडर कंट्रोल रूम (फ़ॉर्म व प्रोफाइल दोनों चालू)
      else if (id === "provider") {
        renderProviderDashboard(container);
      }
      // 10. सामान्य फॉलबैक
      else {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:18px; padding:24px; text-align:center;">
            <div style="font-size:40px; margin-bottom:8px;">💰</div>
            <h3>${id.toUpperCase()} सेवा सक्रिय</h3>
            <p style="font-size:12px; color:#666; margin-top:6px;">यह मॉड्यूल pow.js द्वारा पूरी तरह लाइव संचालित है।</p>
          </div>
        `;
      }
    },

    // बिल काटने पर बरकत पॉइंट बढ़ना: 0.05 प्रति बिल, अधिकतम 2.0
    generateRxBill: function() {
      let b = getBarkatData();
      if (b.todayBills >= 40 || b.todayPoints >= 2.0) {
        alert("⚠️ आज की बरकत सीमा पूरी हो चुकी है!\nआज के 40 बिल और 2.0 पॉइंट पूरे हो गए हैं।");
      } else {
        b.todayBills += 1;
        b.todayPoints = parseFloat((b.todayPoints + 0.05).toFixed(2));
        b.totalVault = parseFloat((b.totalVault + 0.05).toFixed(2));
        saveBarkatData(b);
        alert(`✓ बिल सफलतापूर्वक बना!\n🪙 बरकत मिली: +0.05 पॉइंट\nआज के बिल: ${b.todayBills}/40 (आज की बरकत: ${b.todayPoints.toFixed(2)}/2.0)`);
      }
      window.print();
    },

    // चाय पिलाने का एक्शन
    serveChai: function(custId) {
      const c = CHUPA_APP_CONFIG.customers.find(x => x.id === custId);
      if (c) {
        c.chaiCount += 1;
        alert(`☕ ${c.name} को मुंशी जी की स्पेशल चाय पिलाई गई!\nकुल चाय: ${c.chaiCount} बार।`);
        this.renderModule('munshi_ai');
      }
    },

    // कुटाई (तकादा) एक्शन
    startKutai: function(custId) {
      const c = CHUPA_APP_CONFIG.customers.find(x => x.id === custId);
      if (c) {
        alert(`🥊 कुटाई अलर्ट!\n${c.name} (${c.amt}) को कड़क तकादे का WhatsApp नोटिस जारी हुआ!`);
      }
    },

    addNewCustomer: function() {
      const n = prompt("ग्राहक का नाम:");
      const p = prompt("WhatsApp नंबर:");
      const a = prompt("बकाया राशि (उदा. ₹500):");
      if (n && a) {
        CHUPA_APP_CONFIG.customers.push({
          id: "c_" + Date.now(),
          name: n,
          phone: p || "9876543210",
          amt: a.startsWith("₹") ? a : ("₹" + a),
          isDue: true,
          color: "#7c3aed",
          chaiCount: 0,
          kutaiWarning: "नया खाता"
        });
        alert("ग्राहक सफलतापूर्वक बहीखाते में जुड़ा!");
        this.renderModule('ledger');
      }
    },

    applyRxTemplate: function () {
      const val = document.getElementById("rxTemplateSelect").value;
      const details = document.getElementById("rxDetails");
      if (val === "1") details.value = "1. IFT + US थेरेपी (15 मिनट)\n2. कोर स्ट्रेचिंग व हॉट फर्मेंटेशन\n3. भारी वजन उठाने से परहेज";
      else if (val === "2") details.value = "1. सर्वाइकल ट्रैक्शन व अल्ट्रासाउंड थेरेपी\n2. चिन-टक व नेक आइसोमेट्रिक व्यायाम\n3. तकिए की मोटाई 3 इंच रखें";
      else if (val === "3") details.value = "1. शोल्डर पुली व पेंडुलम मूवमेंट\n2. ड्राई कपिंग थेरेपी (पेन रिलीफ)\n3. दिन में 2 बार गर्म सिकाई";
      else if (val === "4") details.value = "1. क्वाड्रिसेप्स स्ट्रेंथनिंग\n2. नी-कैप ब्रेस का इस्तेमाल\n3. सीढ़ियाँ चढ़ना कम करें";
      else details.value = "1. प्राथमिक ओपीडी परामर्श\n2. गुनगुने पानी का सेवन\n3. 7 दिन बाद पुनः मूल्यांकन";
    }
  };

  function renderDirectoryList() {
    const box = document.getElementById("powInnerDirectory");
    if (!box) return;
    let myP = JSON.parse(localStorage.getItem('chupa_my_single_profile'));
    let list = [
      { name: "सुरेश मौर्या", role: "इलेक्ट्रीशियन", pin: "271801", score: 14, fee: "₹250", phone: "9876543210" },
      { name: "अमित वर्मा", role: "होम ट्यूशन", pin: "271801", score: 9, fee: "₹1200", phone: "9876543211" },
      { name: "कल्लू मिस्त्री", role: "राजमिस्त्री", pin: "271801", score: 3, fee: "₹650", phone: "9876543212" }
    ];
    if (myP) list.unshift(myP);

    box.innerHTML = list.map(p => `
      <div style="background:#161f30; border:1px solid #23324a; border-radius:14px; padding:12px; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; font-weight:800;">
          <div>${p.name} <small style="color:#38bdf8; font-size:11px;">(${p.category || p.role})</small></div>
          <div style="color:#38bdf8;">PoW: ${p.score}</div>
        </div>
        <div style="font-size:11px; color:#94a3b8; margin:6px 0;">पिन: ${p.pin} • फीस: <b style="color:#fde047;">${p.fee}</b></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <a href="tel:${p.phone}" style="background:#10b981; color:#fff; text-align:center; padding:8px; border-radius:8px; text-decoration:none; font-size:12px; font-weight:800;">📞 कॉल</a>
          <a href="https://wa.me/91${p.phone}" target="_blank" style="background:#25d366; color:#fff; text-align:center; padding:8px; border-radius:8px; text-decoration:none; font-size:12px; font-weight:800;">💬 चैट</a>
        </div>
      </div>
    `).join('');
  }

  // प्रोवाइडर कंट्रोल रूम: फ़ॉर्म व प्रोफाइल दोनों शामिल
  function renderProviderDashboard(container) {
    let p = JSON.parse(localStorage.getItem('chupa_my_single_profile'));

    // यदि खाता नहीं बना है: फ़ॉर्म दिखाओ
    if (!p) {
      container.innerHTML = `
        <div style="background:#fff; border:1px solid var(--g-border); border-radius:18px; padding:16px;">
          <h3 style="font-size:16px; color:var(--g-primary-blue); margin-bottom:12px;">📝 नया प्रोवाइडर पंजीकरण</h3>
          <p style="font-size:11.5px; color:#64748b; margin-bottom:12px;">* इस डिवाइस से केवल एक ही प्रोफाइल लॉक होगी।</p>
          <input type="text" id="regPName" class="u-input" placeholder="पूरा नाम">
          <select id="regPCat" class="u-input" style="font-weight:700;">
            <option value="AC / कूलर रिपेयर">❄️ AC / कूलर रिपेयर</option>
            <option value="इलेक्ट्रीशियन व रिपेयर">⚡ इलेक्ट्रीशियन व रिपेयर</option>
            <option value="होम ट्यूशन (गणित/साइंस)">📚 होम ट्यूशन (गणित/साइंस)</option>
            <option value="प्लंबर व फिटिंग">🔧 प्लंबर व फिटिंग</option>
            <option value="राजमिस्त्री व निर्माण">🧱 राजमिस्त्री व निर्माण</option>
            <option value="दिहाड़ी सहायक / लेबर">🏗️ दिहाड़ी सहायक / लेबर</option>
          </select>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <input type="text" id="regPPin" class="u-input" placeholder="पिन कोड">
            <input type="text" id="regPArea" class="u-input" placeholder="शहर / इलाका">
          </div>
          <input type="text" id="regPFee" class="u-input" placeholder="अपेक्षित फीस (उदा. ₹500/दिन)">
          <input type="tel" id="regPPhone" class="u-input" placeholder="WhatsApp नंबर">
          <button class="btn-std" style="background:var(--g-primary-blue); color:#fff;" onclick="window.saveNewProviderProfile()">पंजीकरण सुरक्षित करें</button>
        </div>
      `;
      return;
    }

    // यदि खाता मौजूद है: कंट्रोल रूम दिखाओ
    container.innerHTML = `
      <div style="background:#fff; border:1px solid var(--g-border); border-radius:18px; padding:16px;">
        <h3 style="font-size:16px; color:var(--g-primary-blue); margin-bottom:12px;">🛠️ ${p.name} (${p.category})</h3>
        <div class="gaddi-grid" style="margin-top:0; margin-bottom:14px;">
          <div class="g-pill"><small>साप्ताहिक हाजिरी</small><strong style="font-size:20px; color:var(--g-primary-blue);">${p.attendance} / 4</strong></div>
          <div class="g-pill"><small>PoW स्कोर</small><strong style="font-size:20px; color:var(--g-green);">${p.score} अंक</strong></div>
        </div>
        <div style="font-size:12px; background:var(--g-chip-bg); padding:10px; border-radius:12px; margin-bottom:12px;">
          📍 <b>स्थान:</b> ${p.area} (${p.pin})<br>
          💰 <b>फीस:</b> ${p.fee} • 📱 <b>नंबर:</b> ${p.phone}
        </div>
        <button id="powAttBtn" class="btn-std" style="background:#16a34a; color:#fff; margin-bottom:10px;" onclick="window.markProviderAtt()">🟢 आज की हाजिरी दर्ज करें</button>
        <button id="powThankYouBtn" class="btn-std" style="background:var(--g-primary-blue); color:#fff; margin-bottom:10px;">🙏 धन्यवाद! काम पूरा हुआ</button>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button class="btn-std" style="background:#fff; border:1px solid var(--g-primary-blue); color:var(--g-primary-blue); font-size:12px;" onclick="window.editProviderProfile()">✏️ प्रोफाइल एडिट</button>
          <button class="btn-std" style="background:#fff; border:1px solid #ef4444; color:#ef4444; font-size:12px;" onclick="window.deleteProviderProfile()">🗑️ खाता मिटाएँ</button>
        </div>
      </div>
    `;

    const tyBtn = document.getElementById("powThankYouBtn");
    const now = Date.now();
    const diff = now - (p.lastThankYouTime || 0);

    if (diff < ONE_DAY_MS) {
      const hrs = Math.ceil((ONE_DAY_MS - diff)/(1000*60*60));
      tyBtn.innerText = `⏳ आज का धन्यवाद दर्ज है (${hrs} घंटे बाकी)`;
      tyBtn.style.opacity = "0.5";
      tyBtn.style.cursor = "not-allowed";
    }

    tyBtn.onclick = function () {
      const currentNow = Date.now();
      const currentDiff = currentNow - (p.lastThankYouTime || 0);
      if (currentDiff < ONE_DAY_MS) {
        const hrs = Math.ceil((ONE_DAY_MS - currentDiff)/(1000*60*60));
        alert(`⚠️ PoW नियम: 24 घंटे में सिर्फ 1 बार धन्यवाद मान्य है!\n\nअगला धन्यवाद आप ${hrs} घंटे बाद दर्ज कर सकते हैं।`);
        return;
      }
      p.score += 2;
      p.lastThankYouTime = currentNow;
      localStorage.setItem('chupa_my_single_profile', JSON.stringify(p));
      alert("🙏 धन्यवाद स्वीकार हुआ! PoW स्कोर 2 अंक बढ़ गया।\nअगला धन्यवाद अब ठीक 24 घंटे बाद खुलेगा।");
      window.powApp.renderModule("provider");
    };
  }

  // ग्लोबल प्रोवाइडर फ़ंक्शंस
  window.saveNewProviderProfile = function() {
    const name = document.getElementById("regPName").value.trim();
    const category = document.getElementById("regPCat").value;
    const pin = document.getElementById("regPPin").value.trim();
    const area = document.getElementById("regPArea").value.trim() || "स्थानीय";
    const fee = document.getElementById("regPFee").value.trim() || "आपसी बातचीत";
    const phone = document.getElementById("regPPhone").value.trim();

    if (!name || !pin || !phone) {
      alert("कृपया नाम, पिन कोड और मोबाइल नंबर अवश्य भरें!");
      return;
    }

    const p = {
      name,
      category,
      pin,
      area,
      fee,
      phone,
      attendance: 1,
      score: 3,
      lastThankYouTime: 0,
      lastAttDate: new Date().toLocaleDateString()
    };
    localStorage.setItem('chupa_my_single_profile', JSON.stringify(p));
    alert("प्रोफाइल सफलतापूर्वक बन गई!");
    window.powApp.renderModule("provider");
  };

  window.markProviderAtt = function() {
    let p = JSON.parse(localStorage.getItem('chupa_my_single_profile'));
    const today = new Date().toLocaleDateString();
    if (p.lastAttDate === today) {
      alert("आज की हाजिरी पहले ही दर्ज हो चुकी है!");
      return;
    }
    p.attendance += 1;
    p.lastAttDate = today;
    localStorage.setItem('chupa_my_single_profile', JSON.stringify(p));
    alert("हाजिरी दर्ज हो गई!");
    window.powApp.renderModule("provider");
  };

  window.editProviderProfile = function() {
    let p = JSON.parse(localStorage.getItem('chupa_my_single_profile'));
    const n = prompt("नया नाम:", p.name);
    if (n) p.name = n;
    const a = prompt("नया इलाका:", p.area);
    if (a) p.area = a;
    const f = prompt("नई फीस:", p.fee);
    if (f) p.fee = f;
    localStorage.setItem('chupa_my_single_profile', JSON.stringify(p));
    window.powApp.renderModule("provider");
  };

  window.deleteProviderProfile = function() {
    if (confirm("क्या आप वाकई इस फोन से प्रोफाइल नष्ट करना चाहते हैं? सारा डेटा मिट जाएगा।")) {
      localStorage.removeItem('chupa_my_single_profile');
      alert("खाता मिटा दिया गया।");
      window.powApp.renderModule("provider");
    }
  };

  // 4. होम UI निर्माण
  function buildHomeLayout() {
    const b = getBarkatData();

    // 4 क्विक एक्शन बटन्स
    const qaBox = document.getElementById("homeQuickActions");
    if (qaBox) {
      qaBox.innerHTML = CHUPA_APP_CONFIG.quickActions.map(q => `
        <div class="qa-item" onclick="window.handleQuickAction('${q.action}')" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
          <div style="width:50px; height:50px; border-radius:16px; background:#e8f0fe; display:grid; place-items:center; font-size:22px; margin-bottom:6px; color:#0b57d0;">${q.icon}</div>
          <span style="font-size:11px; font-weight:700;">${q.label}</span>
        </div>
      `).join('');
    }

    // चिप्स (बरकत लाइव पॉइंट)
    const chipBox = document.getElementById("homeChips");
    if (chipBox) {
      chipBox.innerHTML = `
        <div class="g-chip" onclick="window.powApp.switchScreen('settings', 'बरकत वॉल्ट')" style="cursor:pointer;">🪙 बरकत: <strong>${b.totalVault.toFixed(2)}</strong></div>
        <div class="g-chip">🏆 रिवॉर्ड्स: <strong>₹79</strong></div>
        <div class="g-chip">🛡️ 256-Bit वॉल्ट</div>
      `;
    }

    // गद्दी कार्ड
    const gaddiBox = document.getElementById("homeGaddiCard");
    if (gaddiBox) {
      gaddiBox.innerHTML = `
        <div class="net-box">
          <div>
            <div style="font-size:11.5px; color:#444746; font-weight:600; text-transform:uppercase;">गद्दी का कुल बकाया संतुलन</div>
            <div class="net-val">${CHUPA_APP_CONFIG.gaddi.netVal}</div>
          </div>
          <button onclick="window.powApp.switchScreen('munshi_ai', 'मुंशी जी डेस्क')" style="border:none; background:#fef3c7; color:#b45309; padding:6px 14px; border-radius:16px; font-size:11.5px; font-weight:800; cursor:pointer;">☕ मुंशी जी तकादा ↗</button>
        </div>
        <div class="gaddi-grid">
          <div class="g-pill"><small style="font-size:10.5px; color:#444746; display:block;">लेना है (उधार)</small><strong style="color:#b3261e; font-size:16px;">${CHUPA_APP_CONFIG.gaddi.lendAmt}</strong></div>
          <div class="g-pill"><small style="font-size:10.5px; color:#444746; display:block;">देना है (जमा)</small><strong style="color:#146c2e; font-size:16px;">${CHUPA_APP_CONFIG.gaddi.dueAmt}</strong></div>
        </div>
      `;
    }

    // ग्राहक बहीखाता (Recent)
    const peopleBox = document.getElementById("homePeopleGrid");
    if (peopleBox) {
      peopleBox.innerHTML = CHUPA_APP_CONFIG.customers.map(c => `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" onclick="window.powApp.switchScreen('ledger', 'बहीखाता')">
          <div style="width:50px; height:50px; border-radius:50%; display:grid; place-items:center; color:#fff; background:${c.color}; font-size:17px; font-weight:800; margin-bottom:6px;">${c.name[0]}</div>
          <div style="font-size:11px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:72px;">${c.name}</div>
          <div style="font-size:10px; font-weight:800; color:${c.isDue ? '#b3261e' : '#146c2e'};">${c.amt}</div>
        </div>
      `).join('');
    }

    // सेवाएँ ग्रिड
    const srvBox = document.getElementById("homeServicesGrid");
    if (srvBox) {
      srvBox.innerHTML = CHUPA_APP_CONFIG.services.map(s => `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" onclick="window.powApp.switchScreen('${s.id}', '${s.name}')">
          <div style="width:50px; height:50px; border-radius:50%; border:1px solid #e0e2ec; background:${s.bg||'#ffffff'}; display:grid; place-items:center; font-size:22px; margin:0 auto 6px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">${s.icon}</div>
          <div style="font-size:11px; font-weight:700; color:#1f1f1f; line-height:1.2;">${s.name}</div>
        </div>
      `).join('');
    }

    // बॉटम डॉक
    const dockBox = document.getElementById("bottomDockNav");
    if (dockBox) {
      dockBox.innerHTML = CHUPA_APP_CONFIG.dockNav.map(d => {
        if (d.isCenter) {
          return `<div style="flex:1; display:flex; justify-content:center;"><div class="docked-scan-btn" onclick="window.handleQuickAction('scan')">${d.icon}</div></div>`;
        }
        return `
          <button class="dock-btn ${d.id==='home'?'active':''}" id="dock_${d.id}" onclick="window.powApp.switchScreen('${d.id}', '${d.label}')">
            <div>${d.icon}</div>
            <span>${d.label}</span>
          </button>
        `;
      }).join('');
    }
  }

  // 4 क्विक एक्शन हैंडलर
  window.handleQuickAction = function(action) {
    if (action === 'scan') {
      const upi = prompt("QR कोड स्कैन परिणाम या UPI ID दर्ज करें:");
      if (upi) window.location.href = `upi://pay?pa=${encodeURIComponent(upi)}&pn=Merchant&cu=INR`;
    } else if (action === 'pay') {
      const num = prompt("भुगतान हेतु 10 अंकों का मोबाइल नंबर दर्ज करें:");
      if (num) window.location.href = `upi://pay?pa=${num}@upi&cu=INR`;
    } else if (action === 'bank') {
      alert("खाता संख्या एवं IFSC ट्रांसफर इंटरफ़ेस सक्रिय।");
    } else if (action === 'recharge') {
      window.open("https://www.jio.com", "_blank");
    }
  };

  window.addEventListener("DOMContentLoaded", () => {
    buildHomeLayout();
    initLiveCanvasAnimation();
    updateAdStageUI();

    setInterval(() => {
      currentAdIdx = (currentAdIdx + 1) % CHUPA_APP_CONFIG.adStage.items.length;
      updateAdStageUI();
    }, CHUPA_APP_CONFIG.adStage.intervalMs);
  });
})();
