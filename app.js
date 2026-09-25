/* =========================================================
   CHUPAKABRA KHATA: APP.JS MASTER ENGINE
   बहीखाता, फ्लोटिंग अवतार, रॉयल QR पोस्टर, मालिक मीटर 2569
   ========================================================= */

const PK_MASTER = "chupa_profile_tricolor";
const CK_MASTER = "chupa_customers_zero";
const VK_MASTER = "chupa_vault_master";
const BK_MASTER = "chupa_bill_count_master";
const RK_MASTER = "chupa_reactions_master";
const AVATAR_KEY = "chupa_custom_avatar_b64";

// 1. मर्चेंट प्रोफाइल (डिफ़ॉल्ट साफ़ ढाँचा)
let profile = JSON.parse(localStorage.getItem(PK_MASTER)) || {
  merchantName: "",
  shopName: "मेरी दुकान का खाता",
  profession: "व्यापारी / दुकानदार",
  shopPhone: "",
  gstin: "",
  upi: "meet2ravindra@okaxis"
};

// 2. शून्य डमी डेटा बहीखाता (Zero Dummy Data - Completely Fresh)
let customers = JSON.parse(localStorage.getItem(CK_MASTER)) || [];
let vault = Number(localStorage.getItem(VK_MASTER) || "0.25");
let billCount = Number(localStorage.getItem(BK_MASTER) || "101");
let reactions = JSON.parse(localStorage.getItem(RK_MASTER)) || { chai: 0, kutai: 0, visits: 1 };

let activeCustomerId = null;
let currentTxType = 'give';
let globalQrCanvasObj = null;

reactions.visits = (reactions.visits || 0) + 1;
localStorage.setItem(RK_MASTER, JSON.stringify(reactions));

/* =========================================================
   1. प्रोफाइल स्लाइडिंग ड्रॉअर व फोटो अपलोड इंजन
   ========================================================= */
function openProfileDrawer() {
  document.getElementById("profName").value = profile.merchantName || "";
  document.getElementById("profShop").value = profile.shopName || "";
  document.getElementById("profProfession").value = profile.profession || "";
  document.getElementById("profPhone").value = profile.shopPhone || "";
  document.getElementById("profGst").value = profile.gstin || "";
  document.getElementById("profUpi").value = profile.upi || "meet2ravindra@okaxis";

  document.getElementById("profileDrawerOverlay").classList.add("active");
  document.getElementById("profileDrawer").classList.add("active");
}

function closeProfileDrawer() {
  document.getElementById("profileDrawerOverlay").classList.remove("active");
  document.getElementById("profileDrawer").classList.remove("active");
}

function triggerPhotoUpload() {
  const fileInput = document.getElementById("avatarFileInput");
  if (fileInput) fileInput.click();
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("कृपया केवल फोटो (Image फ़ाइल) चुनें!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    localStorage.setItem(AVATAR_KEY, base64Data);
    applyAvatarToUI(base64Data);
    toast("नई फोटो सफलता से सेट हो गई! 🐉✓");
  };
  reader.readAsDataURL(file);
}

function applyAvatarToUI(src) {
  const floatingImg = document.getElementById("floatingAiAvatar");
  const drawerImg = document.getElementById("drawerAvatarImg");
  const targetSrc = src || localStorage.getItem(AVATAR_KEY) || "logo.png";

  if (floatingImg) floatingImg.src = targetSrc;
  if (drawerImg) drawerImg.src = targetSrc;
}

function saveProfileData() {
  const mName = document.getElementById("profName").value.trim();
  const sName = document.getElementById("profShop").value.trim();
  const prof = document.getElementById("profProfession").value.trim();
  const phone = document.getElementById("profPhone").value.trim();
  const gst = document.getElementById("profGst").value.trim().toUpperCase();
  const upi = document.getElementById("profUpi").value.trim();

  profile.merchantName = mName;
  profile.shopName = sName || "मेरी दुकान का खाता";
  profile.profession = prof || "व्यापारी";
  profile.shopPhone = phone;
  profile.gstin = gst;
  profile.upi = upi || "meet2ravindra@okaxis";

  localStorage.setItem(PK_MASTER, JSON.stringify(profile));
  updateProfileUI();
  closeProfileDrawer();
  toast("प्रोफाइल सुरक्षित हुई ✓");
}

function updateProfileUI() {
  const dispName = document.getElementById("dispMerchantName");
  if (dispName) dispName.textContent = profile.shopName || "दुकानदार खाता";
}

function logoutMerchant() {
  if (confirm("क्या आप वाकई लॉगआउट / सत्र रीसेट करना चाहते हैं?")) {
    sessionStorage.clear();
    location.reload();
  }
}

/* =========================================================
   2. गुप्त मालिक मीटर (पिन 2569)
   ========================================================= */
function verifyMeterPin() {
  const enteredPin = document.getElementById("inputMeterPin").value.trim();
  const displayBox = document.getElementById("meterStatsDisplay");

  if (enteredPin === "2569") {
    document.getElementById("stVisits").textContent = reactions.visits || 1;
    document.getElementById("stBills").textContent = Math.max(0, billCount - 100);
    document.getElementById("stChai").textContent = reactions.chai || 0;
    document.getElementById("stKutai").textContent = reactions.kutai || 0;
    document.getElementById("stBarkat").textContent = vault.toFixed(2);
    displayBox.style.display = "block";
    toast("मालिक मीटर अनलॉक हुआ! 🔐✓");
  } else {
    alert("अमान्य सुरक्षा पिन! केवल अधिकृत मालिक हेतु।");
    displayBox.style.display = "none";
  }
}

/* =========================================================
   3. बरकत रिवॉर्ड इंजन: 0.05 × 40 = 2.0 दैनिक सीमा
   ========================================================= */
function addVaultReward(amount = 0.05) {
  const today = new Date().toISOString().slice(0, 10);
  const key = "chupaDailyEarned_" + today;
  let earnedToday = Number(localStorage.getItem(key) || "0");

  if (earnedToday < 2.00) {
    const toAdd = Math.min(amount, 2.00 - earnedToday);
    vault += toAdd;
    earnedToday += toAdd;
    localStorage.setItem(key, earnedToday.toFixed(2));
    localStorage.setItem(VK_MASTER, vault.toFixed(2));
    toast(`+${toAdd.toFixed(2)} बरकत सिक्का तिजोरी में जुड़ा 🪙`);
  } else {
    toast("आज का बरकत कोटा (2.00 सिक्के) पूरा हो चुका है!");
  }
}

/* =========================================================
   4. ग्राहक बहीखाता (100% शून्य डमी डेटा - फ्रेश एंट्री)
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
  if (getEl) getEl.textContent = "₹" + totalGet.toLocaleString("en-IN");
  if (giveEl) giveEl.textContent = "₹" + totalGive.toLocaleString("en-IN");
}

function renderCustomerWorkspace() {
  const emptyState = document.getElementById("emptyStateMsg");
  const listContainer = document.getElementById("customerLedgerList");

  if (!customers || customers.length === 0) {
    emptyState.style.display = "block";
    listContainer.style.display = "none";
    listContainer.innerHTML = "";
    updateGaddiSummary();
    return;
  }

  emptyState.style.display = "none";
  listContainer.style.display = "flex";

  listContainer.innerHTML = customers.map(c => {
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

  updateGaddiSummary();
}

function openNewCustomerModal() {
  document.getElementById("newCustName").value = "";
  document.getElementById("newCustPhone").value = "";
  document.getElementById("newCustomerModal").style.display = "flex";
}

function saveNewCustomerRecord() {
  const name = document.getElementById("newCustName").value.trim();
  const phone = document.getElementById("newCustPhone").value.trim();

  if (!name) { toast("ग्राहक का नाम दर्ज करें"); return; }
  if (!phone || phone.length < 10) { toast("10 अंकों का फोन नंबर डालें"); return; }

  const newCust = {
    id: "cust_" + Date.now(),
    name: name,
    phone: phone,
    chais: 0,
    tx: []
  };

  customers.unshift(newCust);
  localStorage.setItem(CK_MASTER, JSON.stringify(customers));
  closeModal("newCustomerModal");
  renderCustomerWorkspace();
  toast(`${name} का नया खाता खुल गया ✓`);
}

function openCustomerDetailView(id) {
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
        <button type="button" class="btn-close-sm" onclick="this.closest('.modal').remove()">✕</button>
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
              <div><b>${esc(t.note || (t.type==='give'?'उधार دیا':'भुगतान'))}</b><div style="font-size:9.5px;color:var(--text-muted);">${t.date}</div></div>
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
  document.getElementById("txEntryTitle").textContent = (type === "give") ? "उधार दर्ज करें" : "भुगतान मिला दर्ज करें";
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
  renderCustomerWorkspace();
  toast(currentTxType === "give" ? `₹${amt} उधार चढ़ाया ✓` : `₹${amt} भुगतान दर्ज हुआ ✓`);
}

function sendCustomerWhatsAppReminder(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;
  const b = calculateCustomerBal(c);
  if (b <= 0) { alert("इस खाते पर कोई बकाया नहीं है!"); return; }

  const msg = `नमस्ते ${c.name} जी 🙏\n${profile.shopName} पर आपका ₹${b} का बकाया है।\nकृपया समय पर भुगतान करें।\nUPI: ${profile.upi}\nधन्यवाद!`;
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
      <h2 style="font-size:16px;font-weight:800;">⚡ गति: त्वरित एक्शन</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;">
        <button type="button" class="btn" style="background:#fff7ed;border:1px solid #fdba74;color:#c2410c;height:48px;" onclick="this.closest('.modal').remove();openNewCustomerModal();">＋ नया ग्राहक</button>
        <button type="button" class="btn" style="background:#eff6ff;border:1px solid #93c5fd;color:#0284c7;height:48px;" onclick="this.closest('.modal').remove();openRoyalQrModal();">▣ मर्चेंट QR</button>
      </div>
      <button type="button" class="btn-cancel" style="width:100%;" onclick="this.closest('.modal').remove()">बंद करें</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function navToSection(type) {
  if (type === 'grahak') {
    openNewCustomerModal();
  } else if (type === 'mandi') {
    fetchMandiRatesModal();
  }
}

function openLockedBankModal() {
  document.getElementById("lockedBankModal").style.display = "flex";
}

/* =========================================================
   6. Agmarknet लाइव सरकारी मंडी भाव
   ========================================================= */
async function fetchMandiRatesModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:800;">🌾 लाइव सरकारी मंडी भाव</h2>
        <button type="button" class="btn-close-sm" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <select id="mandiDistrictSelect" class="d-input" onchange="loadDistrictMandiData(this.value)" style="font-weight:700;">
        <option value="Bahraich" selected>📍 बहराइच (Bahraich)</option>
        <option value="Aligarh">📍 अलीगढ़ (Aligarh)</option>
        <option value="Bulandshahr">📍 बुलंदशहर (Bulandshahr)</option>
      </select>
      <div id="mandiDataContainer" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
        <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);">ताज़ा भाव लोड हो रहे हैं...</div>
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
          <b>${esc(r.commodity)}</b><br>
          <strong style="color:var(--india-green);font-size:16px;">₹${Number(r.modal_price||0).toLocaleString("en-IN")}</strong><br>
          <small style="color:var(--text-muted);">${esc(r.market)}</small>
        </div>
      `).join("");
    } else throw new Error();
  } catch(e) {
    box.innerHTML = `
      <div style="background:#f8fafc;border:1px solid var(--border-line);border-radius:12px;padding:10px;"><b>गेहूँ (शरबती)</b><br><strong style="color:var(--india-green);font-size:16px;">₹2,650</strong><br><small>स्थानीय मंडी</small></div>
      <div style="background:#f8fafc;border:1px solid var(--border-line);border-radius:12px;padding:10px;"><b>सरसों (काली)</b><br><strong style="color:var(--india-green);font-size:16px;">₹5,400</strong><br><small>स्थानीय मंडी</small></div>
    `;
  }
}

/* =========================================================
   7. रॉयल UPI QR कोड व 600×850 पोस्टर डाउनलोड इंजन
   ========================================================= */
function openRoyalQrModal() {
  document.getElementById("qrPosterShopTitle").textContent = profile.shopName || "मेरी दुकान का खाता";
  document.getElementById("qrPosterUpiText").textContent = `UPI: ${profile.upi || 'meet2ravindra@okaxis'}`;
  document.getElementById("royalQrModal").style.display = "flex";
  renderQrWithDragonCenter();
}

function renderQrWithDragonCenter() {
  const canvas = document.getElementById("posterQrCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const upiUri = `upi://pay?pa=${encodeURIComponent(profile.upi || 'meet2ravindra@okaxis')}&pn=${encodeURIComponent(profile.shopName || 'ChupakabraKhata')}&cu=INR`;

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
    logo.src = localStorage.getItem(AVATAR_KEY) || "logo.png";
    logo.onload = () => {
      const center = 130;
      const radius = 34;

      // 1. सफ़ेद गोल पैच व हरा बॉर्डर
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#059669";
      ctx.stroke();

      // 2. लोगो क्लिप
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

  // डार्क-गोल्ड फिनटेक बैकग्राउंड
  const grad = ctx.createLinearGradient(0, 0, 0, 850);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 850);

  // गोल्ड बॉर्डर
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#f59e0b";
  ctx.strokeRect(20, 20, 560, 810);

  // हेडर
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(profile.shopName || "मेरी दुकान का खाता", 300, 100);

  ctx.fillStyle = "#fde047";
  ctx.font = "600 16px sans-serif";
  ctx.fillText("All-in-One सुरक्षित UPI मर्चेंट QR", 300, 135);

  // सफेद फ्रेम
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(110, 180, 380, 380, [24]);
  ctx.fill();

  // लोगो वाला QR ड्रॉ करें
  ctx.drawImage(globalQrCanvasObj, 130, 200, 340, 340);

  // फुटर जानकारी
  ctx.fillStyle = "#93c5fd";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(`UPI: ${profile.upi || 'meet2ravindra@okaxis'}`, 300, 630);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 15px sans-serif";
  ctx.fillText("GPay • PhonePe • Paytm • BHIM", 300, 675);

  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  ctx.fillText("चुपाकाबरा खाता • भारत के व्यापारी और किसान का सच्चा साथी 🐉", 300, 770);

  const a = document.createElement("a");
  a.href = p.toDataURL("image/png");
  a.download = `${(profile.shopName || 'Chupakabra').replace(/\s+/g, '_')}_QR_Poster.png`;
  a.click();
  toast("रॉयल पोस्टर डाउनलोड हुआ ✓");
}

/* =========================================================
   8. सहायक टूल्स (Helpers, Toast, Init)
   ========================================================= */
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

// ऐप इनिशियलाइज़
window.addEventListener("DOMContentLoaded", () => {
  applyAvatarToUI();
  updateProfileUI();
  renderCustomerWorkspace();
});
