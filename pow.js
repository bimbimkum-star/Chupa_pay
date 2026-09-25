// ==========================================================================
// चुपाकाबरा नेटवर्क - मास्टर कंट्रोलर (pow.js)
// बरकत पॉइंट, चाय पिलाओ, कुटाई, ग्राहक खाता, सेटिंग्स व PoW इंजन
// ==========================================================================

const CHUPA_APP_CONFIG = {
  // 1. लाइव एड्स और एनीमेशन कॉन्फ़िग (वॉल्यूम सपोर्ट सहित)
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

  // 4. ग्राहक बहीखाता (उधार, जमा, चाय, कुटाई हिस्ट्री)
  customers: [
    { id: "c1", name: "राम कुमार", phone: "9876500001", amt: "₹450", isDue: true, color: "#1d4ed8", chaiCount: 3, kutaiWarning: "1st नोटिस भेजा" },
    { id: "c2", name: "मुकेश मेडिकल", phone: "9876500002", amt: "₹130", isDue: true, color: "#047857", chaiCount: 1, kutaiWarning: "सामान्य" },
    { id: "c3", name: "सन्नो किराना", phone: "9876500003", amt: "₹0", isDue: false, color: "#b45309", chaiCount: 5, kutaiWarning: "क्लियर खाता" }
  ],

  // 5. सेवाएँ ग्रिड (सभी 8 आइकॉन)
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

  // 6. मंडी भाव
  mandiData: [
    { item: "गेहूँ (शरबती)", rate: "₹2,650 / कुंतल", mandi: "बहराइच मंडी", change: "+₹30" },
    { item: "सरसों (काली)", rate: "₹5,400 / कुंतल", mandi: "बहराइच मंडी", change: "-₹20" },
    { item: "धान (बासमती)", rate: "₹3,800 / कुंतल", mandi: "बहराइच मंडी", change: "+₹50" }
  ],

  // 7. बॉटम डॉक
  dockNav: [
    { id: "home", label: "होम", icon: "🏠" },
    { id: "pow_network", label: "नेटवर्क", icon: "⚡" },
    { id: "scan", label: "स्कैन", icon: "📷", isCenter: true },
    { id: "ledger", label: "बहीखाता", icon: "📒" },
    { id: "provider", label: "प्रोवाइडर", icon: "🛠️" }
  ]
};

// ==========================================================================
// इंजन निष्पादन कोड
// ==========================================================================
(function () {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let currentAdIdx = 0;
  let audioCtx = null;
  let isSoundActive = false;

  // बरकत पॉइंट लोकल स्टोरेज
  let barkatPoints = parseFloat(localStorage.getItem('chupa_barkat_points') || "0.25");

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

  // Canvas एनीमेशन
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

  // ग्लोबल ऐप ऑब्जेक्ट
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

      // 1. मुंशी जी (चाय पिलाओ व कुटाई डेस्क)
      if (id === "munshi_ai") {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:20px; padding:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div>
                <h3 style="color:#b45309; font-size:16px;">☕ मुंशी जी - चाय व कुटाई पंचायत</h3>
                <small style="color:#64748b;">उधारी वसूली और प्रेमपूर्वक सुलह डेस्क</small>
              </div>
              <span style="font-size:28px;">⚖️</span>
            </div>

            <div style="background:#fef3c7; border:1px solid #fde68a; padding:12px; border-radius:14px; margin-bottom:14px; font-size:12px; line-height:1.5; color:#92400e;">
              <b>मुंशी जी का नियम:</b> "पहले प्रेम से चाय पिलाओ, फिर हिसाब समझाओ। अगर फिर भी टरकाए... तब कुटाई (कड़क कानूनी तकादा) शुरू!"
            </div>

            <div style="font-size:13px; font-weight:800; margin-bottom:8px;">बकायादार सूची (तकादा करें):</div>
            ${CHUPA_APP_CONFIG.customers.filter(c => c.isDue).map(c => `
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <b>${c.name}</b> (${c.amt})<br>
                  <small style="color:#64748b;">☕ पिलाई गई चाय: ${c.chaiCount} बार • स्थिति: ${c.kutaiWarning}</small>
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
      // 2. बहीखाता (ग्राहक सूची व पूरा हिसाब)
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
      // 3. सेटिंग्स व प्रोफाइल
      else if (id === "settings") {
        container.innerHTML = `
          <div style="background:#fff; border:1px solid var(--g-border); border-radius:20px; padding:18px;">
            <h3 style="color:var(--g-primary-blue); font-size:16px; margin-bottom:14px;">⚙️ ऐप व प्रोफाइल सेटिंग्स</h3>
            <div style="margin-bottom:14px; font-size:12.5px; line-height:1.7;">
              👤 <b>मालिक का नाम:</b> रवि कुमार<br>
              📱 <b>रजिस्टर्ड मोबाइल:</b> +91 9369913187<br>
              🪙 <b>बरकत वॉल्ट:</b> ${barkatPoints} पॉइंट सुरक्षित<br>
              🛡️ <b>सुरक्षा:</b> 256-Bit लोकल हार्डवेयर इन्क्रिप्शन
            </div>
            <button class="btn-std" style="background:#0b57d0; color:#fff; margin-bottom:10px;" onclick="window.powApp.addBarkatPoint()">🪙 +0.25 बरकत पॉइंट जोड़ें</button>
            <button class="btn-std" style="background:#ef4444; color:#fff;" onclick="if(confirm('सारा डेटा साफ़ करें?')) { localStorage.clear(); location.reload(); }">⚠️ पूरा कैश व डेटा रीसेट करें</button>
          </div>
        `;
      }
      // 4. क्लिनिक 50 Rx
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
              <button class="btn-std" style="background:#0f172a; color:#fff;" onclick="window.print()">🖨️ पर्चा प्रिंट</button>
              <button class="btn-std" style="background:#16a34a; color:#fff;" onclick="alert('पर्चा WhatsApp पर भेजा गया!')">📲 WhatsApp रसीद</button>
            </div>
          </div>
        `;
      }
      // 5. मंडी भाव
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
      // 6. PoW सर्विस नेटवर्क
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
      // 7. प्रोवाइडर कंट्रोल रूम (1 फोन = 1 प्रोफाइल)
      else if (id === "provider") {
        renderProviderDashboard(container);
      }
    },

    // चाय पिलाने का एक्शन
    serveChai: function(custId) {
      const c = CHUPA_APP_CONFIG.customers.find(x => x.id === custId);
      if (c) {
        c.chaiCount += 1;
        alert(`☕ ${c.name} को मुंशी जी की स्पेशल चाय पिलाई गई!\nकुल चाय: ${c.chaiCount} बार। सुलह का माहौल बन रहा है।`);
        this.renderModule('munshi_ai');
      }
    },

    // कुटाई (तकादा) एक्शन
    startKutai: function(custId) {
      const c = CHUPA_APP_CONFIG.customers.find(x => x.id === custId);
      if (c) {
        alert(`🥊 कुटाई अलर्ट!\n${c.name} (${c.amt}) को कड़क तकादे का WhatsApp और SMS नोटिस भेज दिया गया है!`);
      }
    },

    // बरकत पॉइंट जोड़ना
    addBarkatPoint: function() {
      barkatPoints = parseFloat((barkatPoints + 0.25).toFixed(2));
      localStorage.setItem('chupa_barkat_points', barkatPoints);
      alert(`🪙 बरकत पॉइंट अपडेट: अब आपके पास कुल ${barkatPoints} बरकत पॉइंट हैं!`);
      location.reload();
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

  function renderProviderDashboard(container) {
    let p = JSON.parse(localStorage.getItem('chupa_my_single_profile')) || {
      name: "रवि कुमार",
      category: "AC / कूलर रिपेयर",
      score: 11,
      attendance: 1,
      pin: "202001",
      area: "Naurangabad",
      fee: "₹500",
      phone: "9369913187",
      lastThankYouTime: 0
    };

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
        <button id="powThankYouBtn" class="btn-std" style="background:var(--g-primary-blue); color:#fff; margin-bottom:10px;">🙏 धन्यवाद! काम पूरा हुआ</button>
        <p style="font-size:11px; color:#666; text-align:center;">* 24 घंटे का सख्त टाइम-लॉक pow.js द्वारा मॉनिटर होता है।</p>
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

  function buildHomeLayout() {
    // शीर्ष अवतार पर क्लिक करने से सेटिंग्स खुलना
    const av = document.getElementById("topAvatar");
    if (av) av.onclick = () => window.powApp.switchScreen('settings', 'सेटिंग्स व प्रोफाइल');

    // 4 क्विक एक्शन
    const qaBox = document.getElementById("homeQuickActions");
    if (qaBox) {
      qaBox.innerHTML = CHUPA_APP_CONFIG.quickActions.map(q => `
        <div class="qa-item" onclick="alert('${q.label} सक्रिय')" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
          <div style="width:50px; height:50px; border-radius:16px; background:#e8f0fe; display:grid; place-items:center; font-size:22px; margin-bottom:6px; color:#0b57d0;">${q.icon}</div>
          <span style="font-size:11px; font-weight:700;">${q.label}</span>
        </div>
      `).join('');
    }

    // चिप्स (बरकत पॉइंट लाइव)
    const chipBox = document.getElementById("homeChips");
    if (chipBox) {
      chipBox.innerHTML = `
        <div class="g-chip" onclick="window.powApp.switchScreen('settings', 'बरकत वॉल्ट')" style="cursor:pointer;">🪙 बरकत: <strong>${barkatPoints}</strong></div>
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
          return `<div style="flex:1; display:flex; justify-content:center;"><div class="docked-scan-btn" onclick="alert('UPI QR कैमरा सक्रिय')">${d.icon}</div></div>`;
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
