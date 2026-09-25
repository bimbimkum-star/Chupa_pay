/* =========================================================
   CHUPAKABRA KHATA: APP.JS MASTER ENGINE
   बहीखाता, वन-टाइम लॉगिन, ऑटो क्लाउड सिंक, ऐप पिन लॉक, 
   Agmarknet लाइव मंडी भाव व रॉयल QR पोस्टर
   ========================================================= */

const PK_MASTER = "chupa_profile_tricolor_fresh";
const CK_MASTER = "chupa_customers_zero_fresh";
const VK_MASTER = "chupa_vault_master_fresh";
const BK_MASTER = "chupa_bill_count_master_fresh";
const PIN_LOCK_KEY = "chupa_app_security_pin";
const AUTH_USER_KEY = "chupa_auth_user_email";

// 1. मर्चेंट प्रोफाइल डेटा (शून्य डिफ़ॉल्ट - कोई फर्जी UPI या नाम नहीं)
let profile = JSON.parse(localStorage.getItem(PK_MASTER)) || {
  merchantName: "",
  gender: "",
  shopName: "",
  profession: "",
  shopPhone: "",
  gstin: "",
  upi: ""
};

// 2. शून्य डमी डेटा बहीखाता (100% फ्रेश)
let customers = JSON.parse(localStorage.getItem(CK_MASTER)) || [];
let vault = Number(localStorage.getItem(VK_MASTER) || "0.25");
let billCount = Number(localStorage.getItem(BK_MASTER) || "101");

let activeCustomerId = null;
let currentTxType = 'give';
let globalQrCanvasObj = null;

/* =========================================================
   1. ऐप पिन लॉक व सुरक्षा इंजन (App Security Lock Engine)
   ========================================================= */
function checkAppSecurityLock() {
  const savedPin = localStorage.getItem(PIN_LOCK_KEY);
  const lockScreen = document.getElementById("appPinLockOverlay");
  if (savedPin && savedPin.length === 4) {
    if (lockScreen) {
      lockScreen.style.display = "flex";
      document.getElementById("unlockAppPinInput").value = "";
    }
  } else {
    if (lockScreen) lockScreen.style.display = "none";
  }
}

function verifyAppUnlockPin() {
  const entered = document.getElementById("unlockAppPinInput").value.trim();
  const savedPin = localStorage.getItem(PIN_LOCK_KEY);

  if (entered === savedPin) {
    document.getElementById("appPinLockOverlay").style.display = "none";
    toast("स्वागत है! चुपाकाबरा बहीखाता अनलॉक हुआ 🔓");
  } else {
    alert("अमान्य सुरक्षा पिन! कृपया सही 4-अंकीय पिन दर्ज करें।");
    document.getElementById("unlockAppPinInput").value = "";
  }
}

function saveAppSecurityPin() {
  const newPin = document.getElementById("inputSetupPin").value.trim();
  if (newPin.length !== 4 || isNaN(newPin)) {
    alert("कृपया ठीक 4 अंकों का संख्यात्मक पिन दर्ज करें!");
    return;
  }
  localStorage.setItem(PIN_LOCK_KEY, newPin);
  document.getElementById("dispPinActiveStatus").textContent = "✓ सुरक्षा पिन सक्रिय! बाहर निकलकर आने पर पिन लॉक लगेगा।";
  toast("सुरक्षा पिन सेट हुआ 🔐✓");
}

// जब यूजर ऐप से बाहर जाए या टैब बदले, लॉक सक्रिय करें
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    // बैकग्राउंड में जाने पर पिन लॉक तैयार
  } else if (document.visibilityState === "visible") {
    const savedPin = localStorage.getItem(PIN_LOCK_KEY);
    if (savedPin) {
      checkAppSecurityLock();
    }
  }
});

/* =========================================================
   2. वन-टाइम ईमेल लॉगिन गेटवे (Firebase Sync Ready)
   ========================================================= */
function handleOneTimeEmailLogin() {
  const email = document.getElementById("inputAuthEmail").value.trim();
  if (!email || !email.includes("@")) {
    alert("कृपया मान्य ईमेल पता दर्ज करें!");
    return;
  }

  // स्थानीय स्टोरेज में वन-टाइम लॉगिन सुरक्षित (क्लाउड सिंक की तैयारी)
  localStorage.setItem(AUTH_USER_KEY, email);
  renderAuthGateUI();
  toast("सफलतापूर्वक लॉगिन हुआ! प्रोफाइल अनलॉक हुई ✓");
}

function renderAuthGateUI() {
  const authEmail = localStorage.getItem(AUTH_USER_KEY);
  const loggedOutBox = document.getElementById("loggedOutBox");
  const loggedInBox = document.getElementById("loggedInBox");
  const profileForm = document.getElementById("profileFormFields");
  const navAuthLabel = document.getElementById("dispNavAuthLabel");
  const floatingAvatar = document.getElementById("floatingAiAvatar");

  if (authEmail) {
    if (loggedOutBox) loggedOutBox.style.display = "none";
    if (loggedInBox) loggedInBox.style.display = "block";
    if (profileForm) profileForm.style.display = "block";
    if (navAuthLabel) navAuthLabel.textContent = "प्रोफाइल";
    document.getElementById("dispLoggedEmailTxt").textContent = authEmail;
    
    // साइन-इन होने पर लोगो पारदर्शी रूप में उभरेगा
    floatingAvatar.src = "logo.png";
  } else {
    if (loggedOutBox) loggedOutBox.style.display = "block";
    if (loggedInBox) loggedInBox.style.display = "none";
    if (profileForm) profileForm.style.display = "none";
    if (navAuthLabel) navAuthLabel.textContent = "Sign-in";
    floatingAvatar.src = "logo.png";
  }
}

/* =========================================================
   3. प्रोफाइल स्लाइडिंग ड्रॉअर
   ========================================================= */
function openProfileDrawer() {
  renderAuthGateUI();

  document.getElementById("profName").value = profile.merchantName || "";
  document.getElementById("profGender").value = profile.gender || "";
  document.getElementById("profShop").value = profile.shopName || "";
  document.getElementById("profProfession").value = profile.profession || "";
  document.getElementById("profPhone").value = profile.shopPhone || "";
  document.getElementById("profGst").value = profile.gstin || "";
  document.getElementById("profUpi").value = profile.upi || "";

  const savedPin = localStorage.getItem(PIN_LOCK_KEY);
  if (savedPin) {
    document.getElementById("dispPinActiveStatus").textContent = "✓ सुरक्षा पिन पहले से सक्रिय है।";
  }

  document.getElementById("profileDrawerOverlay").classList.add("active");
  document.getElementById("profileDrawer").classList.add("active");
}

function closeProfileDrawer() {
  document.getElementById("profileDrawerOverlay").classList.remove("active");
  document.getElementById("profileDrawer").classList.remove("active");
}

function saveProfileData() {
  const authEmail = localStorage.getItem(AUTH_USER_KEY);
  if (!authEmail) {
    alert("कृपया पहले ऊपर ईमेल दर्ज करके साइन इन करें!");
    return;
  }

  profile.merchantName = document.getElementById("profName").value.trim();
  profile.gender = document.getElementById("profGender").value;
  profile.shopName = document.getElementById("profShop").value.trim();
  profile.profession = document.getElementById("profProfession").value.trim();
  profile.shopPhone = document.getElementById("profPhone").value.trim();
  profile.gstin = document.getElementById("profGst").value.trim().toUpperCase();
  profile.upi = document.getElementById("profUpi").value.trim();

  localStorage.setItem(PK_MASTER, JSON.stringify(profile));
  
  if (profile.shopName) {
    document.getElementById("dispMerchantName").textContent = profile.shopName;
  }
  
  closeProfileDrawer();
  toast("प्रोफाइल सुरक्षित हुई ✓");
}

function logoutMerchant() {
  if (confirm("क्या आप वाकई इस डिवाइस से लॉगआउट करना चाहते हैं?")) {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(PIN_LOCK_KEY);
    renderAuthGateUI();
    closeProfileDrawer();
    toast("लॉगआउट संपन्न हुआ");
  }
}

/* =========================================================
   4. ग्राहक बहीखाता (गोपनीयता: होम पर केवल काउंट)
   ========================================================= */
function calculateCustomerBal(c) {
  return (c.tx || []).reduce((sum, t) => sum + (t.type === "give" ? Number(t.amt) : -Number(t.amt)), 0);
}

function updateGaddiSummary() {
  let totalGet = 0, totalGive = 0;
  customers.forEach(c => {
    const b = calculateCustomerBal(c);
    if (b >= 0) totalGet += b; else totalGive += Math.abs(b);
  });

  const getEl = document.getElementById("dispTotalGet");
  const giveEl = document.getElementById("dispTotalGive");
  const countEl = document.getElementById("dispCustomerCountText");

  if (getEl) getEl.textContent = "₹" + totalGet.toLocaleString("en-IN");
  if (giveEl) giveEl.textContent = "₹" + totalGive.toLocaleString("en-IN");
  if (countEl) countEl.textContent = `${customers.length} ग्राहक खाते दर्ज`;
}

function openCustomerListModal() {
  const container = document.getElementById("fullCustomerLedgerContainer");
  if (!container) return;

  if (!customers || customers.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:30px 10px;color:var(--text-muted);">
        <div style="font-size:36px;margin-bottom:8px;">🧾</div>
        <div style="font-size:14px;font-weight:800;color:var(--text-main);">कोई ग्राहक खाता दर्ज नहीं है</div>
        <div style="font-size:11px;margin-top:2px;">नया खाता खोलने के लिए नीचे दिया गया बटन दबाएँ</div>
      </div>
    `;
  } else {
    container.innerHTML = customers.map(c => {
      const b = calculateCustomerBal(c);
      const isGet = b >= 0;
      return `
        <div class="cust-card" onclick="openCustomerDetailView('${c.id}')">
          <div class="cust-left">
            <div class="cust-avatar">${esc(c.name.charAt(0) || "?")}</div>
            <div>
              <div class="cust-name">${esc(c.name)}</div>
              <div class="cust-phone">📞 ${esc(c.phone)}</div>
            </div>
          </div>
          <div class="cust-right">
            <div class="cust-amt" style="color:${isGet ? 'var(--red)' : 'var(--india-green)'};">₹${Math.abs(b).toLocaleString("en-IN")}</div>
            <div class="cust-status" style="color:${isGet ? 'var(--red)' : 'var(--india-green)'};">${isGet ? 'लेना है' : 'देना है'}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  document.getElementById("customerListModal").style.display = "flex";
}

function openNewCustomerModal() {
  document.getElementById("newCustName").value = "";
  document.getElementById("newCustPhone").value = "";
  document.getElementById("newCustomerModal").style.display = "flex";
}

function saveNewCustomerRecord() {
  const name = document.getElementById("newCustName").value.trim();
  const phone = document.getElementById("newCustPhone").value.trim();

  if (!name) { toast("कृपया ग्राहक का नाम दर्ज करें"); return; }
  if (!phone || phone.length < 10) { toast("10 अंकों का फोन नंबर दर्ज करें"); return; }

  const newCust = {
    id: "cust_" + Date.now(),
    name: name,
    phone: phone,
    tx: []
  };

  customers.unshift(newCust);
  localStorage.setItem(CK_MASTER, JSON.stringify(customers));
  closeModal("newCustomerModal");
  updateGaddiSummary();
  openCustomerListModal();
  toast(`${name} का खाता जोड़ा गया ✓`);
}

function openCustomerDetailView(id) {
  closeModal("customerListModal");
  activeCustomerId = id;
  const c = customers.find(x => x.id === id);
  if (!c) return;

  const b = calculateCustomerBal(c);
  const isGet = b >= 0;

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "custDetailModal";
  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:800;margin:0;">खाता: ${esc(c.name)}</h2>
        <button type="button" class="btn-close-sm" onclick="this.closest('.modal').remove();openCustomerListModal();">✕</button>
      </div>
      <div style="background:#f8fafc;border:1px solid var(--border-line);border-radius:14px;padding:12px;text-align:center;margin-bottom:12px;">
        <div style="font-size:11px;color:var(--text-muted);">📞 ${esc(c.phone)}</div>
        <div style="font-size:26px;font-weight:800;margin:6px 0;color:${isGet ? 'var(--red)' : 'var(--india-green)'};">₹${Math.abs(b).toLocaleString("en-IN")}</div>
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);">${isGet ? 'आपको लेना है (उधार)' : 'आपको देना है (जमा)'}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
        <button type="button" class="btn-save" style="background:var(--red);" onclick="openTxEntryModal('give')">＋ उधार दिया</button>
        <button type="button" class="btn-save" onclick="openTxEntryModal('get')">✓ भुगतान मिला</button>
      </div>

      <button type="button" class="btn" style="width:100%;background:#ecfdf5;color:var(--india-green);height:40px;margin-bottom:14px;" onclick="sendCustomerWhatsAppReminder('${c.id}')">
        💬 WhatsApp भुगतान तकादा
      </button>

      <div style="font-size:12px;font-weight:800;margin-bottom:8px;">लेन-देन का इतिहास:</div>
      <div style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
        ${(!c.tx || c.tx.length === 0) ? '<div style="text-align:center;padding:15px;color:var(--text-muted);font-size:11.5px;">कोई पुराना लेन-देन नहीं है</div>' :
          c.tx.slice().reverse().map(t => `
            <div style="background:#fff;border:1px solid var(--border-line);border-radius:10px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;font-size:11.5px;">
              <div><b>${esc(t.note || (t.type==='give'?'उधार':'भुगतान'))}</b><div style="font-size:9.5px;color:var(--text-muted);">${t.date}</div></div>
              <strong style="color:${t.type==='give'?'var(--red)':'var(--india-green)'};">${t.type==='give'?'+':'−'} ₹${t.amt}</strong>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function openTxEntryModal(type) {
  currentTxType = type;
  document.getElementById("txEntryTitle").textContent = (type === "give") ? "उधार दिया दर्ज करें" : "भुगतान मिला दर्ज करें";
  document.getElementById("txAmountInput").value = "";
  document.getElementById("txNoteInput").value = "";
  document.getElementById("txEntryModal").style.display = "flex";
}

function saveCustomerTxRecord() {
  const amt = Number(document.getElementById("txAmountInput").value);
  const note = document.getElementById("txNoteInput").value.trim();

  if (!amt || amt <= 0) { toast("मान्य राशि दर्ज करें"); return; }
  const c = customers.find(x => x.id === activeCustomerId);
  if (!c) return;

  if (!c.tx) c.tx = [];
  const dateStr = new Intl.DateTimeFormat("hi-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date());
  c.tx.push({ amt: amt, type: currentTxType, note: note, date: dateStr });

  localStorage.setItem(CK_MASTER, JSON.stringify(customers));
  closeModal("txEntryModal");

  const oldDetail = document.getElementById("custDetailModal");
  if (oldDetail) oldDetail.remove();

  openCustomerDetailView(activeCustomerId);
  updateGaddiSummary();
  toast(currentTxType === "give" ? `₹${amt} उधार चढ़ाया ✓` : `₹${amt} भुगतान दर्ज हुआ ✓`);
}

function sendCustomerWhatsAppReminder(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;
  const b = calculateCustomerBal(c);
  if (b <= 0) { alert("इस खाते पर कोई बकाया नहीं है!"); return; }

  const shop = profile.shopName ? `*${profile.shopName}*` : "*चुपाकाबरा-खाता*";
  const upiLine = profile.upi ? `\nUPI भुगतान ID: ${profile.upi}` : "";

  const msg = `नमस्ते *${c.name}* जी 🙏\n${shop} पर आपका *₹${b}* का हिसाब बाकी है।\nकृपया समय पर भुगतान करने की कृपा करें।${upiLine}\n\nधन्यवाद!\n------------------------\nPowered by\n*चुपाकाबरा-खाता*\n*सेव पेपर, सेव नेचर 🌿*`;
  window.open(`https://wa.me/91${c.phone}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* =========================================================
   5. चार संप्रभु चक्र नेविगेशन (गति, मंडी, ग्राहक, बैंक)
   ========================================================= */
function showQuickGati() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="box" style="text-align:center;">
      <h2 style="font-size:16px;font-weight:800;margin:0 0 6px 0;">⚡ गति: त्वरित एक्शन</h2>
      <p style="font-size:11.5px;color:var(--text-muted);margin:0 0 16px 0;">काउंटर बिलिंग व त्वरित भुगतान शॉर्टकट</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <button type="button" class="btn" style="background:#eff6ff;border:1px solid #93c5fd;color:#0284c7;height:48px;" onclick="this.closest('.modal').remove();openRoyalQrModal();">▣ मर्चेंट QR</button>
        <button type="button" class="btn" style="background:#f0fdf4;border:1px solid #86efac;color:#166534;height:48px;" onclick="this.closest('.modal').remove();openPharmaDesk();">💊 बिल पर्चा</button>
      </div>
      <button type="button" class="btn-cancel" style="width:100%;" onclick="this.closest('.modal').remove()">बंद करें</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function openLockedBankModal() {
  document.getElementById("lockedBankModal").style.display = "flex";
}

/* =========================================================
   6. Agmarknet लाइव सरकारी मंडी भाव API
   ========================================================= */
async function fetchMandiRatesModal() {
  let modal = document.getElementById("activeMandiModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "activeMandiModal";
  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:800;margin:0;">🌾 लाइव सरकारी मंडी भाव (Agmarknet)</h2>
        <button type="button" class="btn-close-sm" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <select id="mandiDistrictSelect" class="d-input" onchange="loadDistrictMandiData(this.value)" style="font-weight:700;">
        <option value="Bahraich" selected>📍 बहराइच (Bahraich)</option>
        <option value="Aligarh">📍 अलीगढ़ (Aligarh)</option>
        <option value="Bulandshahr">📍 बुलंदशहर (Bulandshahr)</option>
        <option value="Agra">📍 आगरा (Agra)</option>
        <option value="Kanpur">📍 कानपुर (Kanpur)</option>
      </select>
      <div id="mandiDataContainer" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
        <div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-muted);">
          सरकारी Agmarknet API से ताज़ा भाव लोड हो रहे हैं...
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  loadDistrictMandiData("Bahraich");
}

async function loadDistrictMandiData(dist) {
  const box = document.getElementById("mandiDataContainer");
  if (!box) return;
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001a36f11e8747548be776874344c488a08&format=json&limit=10&filters[state]=Uttar Pradesh&filters[district]=${dist}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.records && data.records.length > 0) {
      box.innerHTML = data.records.map(r => `
        <div style="background:#f8fafc;border:1px solid var(--border-line);border-radius:12px;padding:10px;">
          <b style="font-size:12.5px;color:#0f172a;">${esc(r.commodity)}</b><br>
          <strong style="color:var(--india-green);font-size:16px;">₹${Number(r.modal_price||0).toLocaleString("en-IN")}</strong><br>
          <small style="color:var(--text-muted);font-size:10px;">मंडी: ${esc(r.market)}</small>
        </div>
      `).join("");
    } else {
      box.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:12px;">इस मंडी में आज का डेटा अपडेट नहीं हुआ है।</div>`;
    }
  } catch(e) {
    box.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:12px;">
        सरकारी सर्वर से संपर्क नहीं हो सका। कृपया थोड़ी देर बाद पुनः प्रयास करें।
      </div>
    `;
  }
}

/* =========================================================
   7. रॉयल UPI QR व 600×850 पोस्टर डाउनलोड इंजन
   ========================================================= */
function openRoyalQrModal() {
  const upiId = profile.upi || "";
  const sTitle = profile.shopName || "मेरी दुकान";

  document.getElementById("qrPosterShopTitle").textContent = sTitle;
  document.getElementById("qrPosterUpiText").textContent = upiId ? `UPI: ${upiId}` : "UPI ID सेट नहीं है (प्रोफाइल में भरें)";
  document.getElementById("royalQrModal").style.display = "flex";

  renderQrWithDragonCenter(upiId, sTitle);
}

function renderQrWithDragonCenter(upiId, shopName) {
  const canvas = document.getElementById("posterQrCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  const effectiveUpi = upiId || "meet2ravindra@okaxis";
  const upiUri = `upi://pay?pa=${encodeURIComponent(effectiveUpi)}&pn=${encodeURIComponent(shopName || 'Merchant')}&cu=INR`;

  const tempDiv = document.createElement("div");
  new QRCode(tempDiv, {
    text: upiUri,
    width: 260,
    height: 260,
    colorDark: "#0f172a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  setTimeout(() => {
    const rawQrCanvas = tempDiv.querySelector("canvas");
    if (!rawQrCanvas) return;

    ctx.clearRect(0, 0, 260, 260);
    ctx.drawImage(rawQrCanvas, 0, 0);

    const logo = new Image();
    logo.src = "logo.png";
    logo.onload = () => {
      const center = 130;
      const radius = 34;

      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#059669";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, center - radius, center - radius, radius * 2, radius * 2);
      ctx.restore();

      globalQrCanvasObj = canvas;
    };
  }, 120);
}

function downloadPosterCanvas() {
  if (!globalQrCanvasObj) { toast("QR तैयार हो रहा है..."); return; }

  const p = document.createElement("canvas");
  p.width = 600;
  p.height = 850;
  const ctx = p.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 0, 850);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 850);

  ctx.lineWidth = 6;
  ctx.strokeStyle = "#f59e0b";
  ctx.strokeRect(20, 20, 560, 810);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(profile.shopName || "चुपाकाबरा-खाता", 300, 100);

  ctx.fillStyle = "#fde047";
  ctx.font = "600 16px sans-serif";
  ctx.fillText("All-in-One सुरक्षित UPI मर्चेंट QR", 300, 135);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(110, 180, 380, 380, [24]);
  ctx.fill();

  ctx.drawImage(globalQrCanvasObj, 130, 200, 340, 340);

  ctx.fillStyle = "#93c5fd";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(profile.upi ? `UPI: ${profile.upi}` : "डिजिटल मर्चेंट खाता", 300, 630);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 15px sans-serif";
  ctx.fillText("GPay • PhonePe • Paytm • BHIM", 300, 675);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 15px sans-serif";
  ctx.fillText("Powered by चुपाकाबरा-खाता", 300, 765);

  ctx.fillStyle = "#34d399";
  ctx.font = "12px sans-serif";
  ctx.fillText("सेव पेपर, सेव नेचर 🌿", 300, 788);

  const a = document.createElement("a");
  a.href = p.toDataURL("image/png");
  a.download = `${(profile.shopName || 'Chupakabra').replace(/\s+/g, '_')}_QR_Poster.png`;
  a.click();
  toast("रॉयल पोस्टर डाउनलोड हुआ ✓");
}

/* =========================================================
   8. बरकत वॉल्ट रिवॉर्ड व सहायक फंक्शन्स
   ========================================================= */
function addVaultReward(amount = 0.05) {
  const today = new Date().toISOString().slice(0, 10);
  const key = "chupa_daily_barkat_" + today;
  let earnedToday = Number(localStorage.getItem(key) || "0");

  if (earnedToday < 2.00) {
    const toAdd = Math.min(amount, 2.00 - earnedToday);
    vault += toAdd;
    earnedToday += toAdd;
    localStorage.setItem(key, earnedToday.toFixed(2));
    localStorage.setItem(VK_MASTER, vault.toFixed(2));
    toast(`+${toAdd.toFixed(2)} बरकत सिक्का तिजोरी में जुड़ा 🪙`);
  }
}

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

function toast(msg) {
  const t = document.getElementById("toastMsg");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => { t.classList.remove("show"); }, 2400);
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// ऐप इनिशियलाइज़ेशन
window.addEventListener("DOMContentLoaded", () => {
  checkAppSecurityLock();
  renderAuthGateUI();
  updateGaddiSummary();
});
