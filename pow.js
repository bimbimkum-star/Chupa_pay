// ==========================================
// चुपाकाबरा नेटवर्क - PoW (Proof of Work) एक्सटर्नल इंजन
// यह फ़ाइल बिना HTML बदले बाहर से पूरे नियम चलाती है
// ==========================================

(function () {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 घंटे का सख्त लॉक

  function monitorAndControlPoW() {
    // 1. डैशबोर्ड से प्रोवाइडर का डेटा निकालें
    let profile = JSON.parse(localStorage.getItem('chupa_my_single_profile'));
    const btn = document.getElementById('btnThankYou');

    if (!profile || !btn) return;

    const now = Date.now();
    const lastTime = profile.lastThankYouTime || 0;
    const diff = now - lastTime;

    // 2. क्या 24 घंटे पूरे हो चुके हैं?
    if (diff < ONE_DAY_MS) {
      // 24 घंटे पूरे नहीं हुए: बटन को लॉक और टाइमर चालू करें
      const hoursLeft = Math.ceil((ONE_DAY_MS - diff) / (1000 * 60 * 60));
      btn.innerText = `⏳ आज का धन्यवाद दर्ज है (${hoursLeft} घंटे बाकी)`;
      btn.style.opacity = "0.55";
      btn.style.filter = "grayscale(70%)";
      btn.style.cursor = "not-allowed";
    } else {
      // 24 घंटे पूरे हो चुके हैं: बटन को एक्टिव करें
      btn.innerText = `🙏 धन्यवाद! काम पूरा हुआ`;
      btn.style.opacity = "1";
      btn.style.filter = "none";
      btn.style.cursor = "pointer";
    }

    // 3. अगर कोई बटन दबाने की कोशिश करे तो बाहर से ही कंट्रोल करें
    btn.onclick = function (e) {
      e.stopImmediatePropagation(); // पुराने इनबिल्ट फंक्शन को ब्लॉक करें

      const currentTime = Date.now();
      let currentProfile = JSON.parse(localStorage.getItem('chupa_my_single_profile'));
      const pastTime = currentProfile.lastThankYouTime || 0;

      // नियम उल्लंघन की जांच
      if (currentTime - pastTime < ONE_DAY_MS) {
        const h = Math.ceil((ONE_DAY_MS - (currentTime - pastTime)) / (1000 * 60 * 60));
        alert(`⚠️ PoW नियम: काम पूरा होने का धन्यवाद 24 घंटे में सिर्फ एक बार मान्य है!\n\nअगला धन्यवाद आप लगभग ${h} घंटे बाद ही दर्ज कर सकते हैं।`);
        return false;
      }

      // वैध काम: स्कोर +2 करें और समय का ताला लगाएं
      currentProfile.score = (currentProfile.score || 0) + 2;
      currentProfile.lastThankYouTime = currentTime;

      // डेटा को फोन की मेमोरी में पक्का सेव करें
      localStorage.setItem('chupa_my_single_profile', JSON.stringify(currentProfile));

      alert('🙏 धन्यवाद स्वीकार हुआ! PoW स्कोर 2 अंक बढ़ गया।\nअगला धन्यवाद अब ठीक 24 घंटे बाद खुलेगा।');

      // स्क्रीन को ताज़ा करें ताकि तुरंत नया स्कोर और टाइमर दिख जाए
      location.reload();
    };
  }

  // पेज लोड होने पर और बैकग्राउंड में हर सेकंड ऑटो-मॉनिटर करें
  window.addEventListener('load', monitorAndControlPoW);
  setInterval(monitorAndControlPoW, 1000);
})();
