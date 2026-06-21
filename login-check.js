/* ============================================================
   AN Psixoloji — Login ve License Check Scripti
   Bütün repo-larda (`index.html`-in sonuna əlavə et):
   <script src="https://samir210-az.github.io/menyu/login-check.js" data-repo="aba-terapiya"></script>
============================================================ */

(function(){
  const repoId = document.currentScript.getAttribute('data-repo') || 'unknown';
  
  // Admin-sa hamısı açıq
  if (localStorage.getItem('isAdmin') === 'true') {
    return; // Kilit yoxdur
  }
  
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    // Giriş edərək yüklə
    showLoginOverlay();
    return;
  }
  
  // Müştəri var — lisenziyasını yoxla
  const customers = JSON.parse(localStorage.getItem('customers') || '{}');
  const userData = customers[currentUser];
  
  if (!userData) {
    localStorage.removeItem('currentUser');
    showLoginOverlay();
    return;
  }
  
  if (!userData.approved) {
    showNotApprovedMessage();
    return;
  }
  
  // Bu repo-daki alətləri al
  const allowedTools = userData.licenses[repoId] || [];
  
  if (allowedTools.length === 0) {
    showNoLicenseMessage(userData.name);
    return;
  }
  
  // Lisenziya var — localStorage-a yaz (hər zaman yenilənirlər)
  window.CURRENT_USER = {
    email: currentUser,
    name: userData.name,
    allowedTools: allowedTools,
    isAdmin: false
  };
  
  // Content göstər
  unlockContent();
  
  function showLoginOverlay(){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:32px;max-width:380px;text-align:center">
        <div style="font-size:32px;margin-bottom:12px">🔐</div>
        <h2 style="margin:0 0 8px;color:#6A0000;font-size:20px">Giriş Tələb olunur</h2>
        <p style="margin:0 0 20px;color:#555;font-size:14px">Bu alətə girmək üçün daxil olmalısınız</p>
        <a href="https://samir210-az.github.io/menyu/login.html" style="display:inline-block;padding:12px 24px;background:#6A0000;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Daxil Ol / Qeydiyyat</a>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }
  
  function showNotApprovedMessage(){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:32px;max-width:380px;text-align:center">
        <div style="font-size:32px;margin-bottom:12px">⏳</div>
        <h2 style="margin:0 0 8px;color:#6A0000;font-size:20px">Gözləyin</h2>
        <p style="margin:0 0 20px;color:#555;font-size:14px">Admin tərəfindən təsdiqlənmə gözləyirsiniz</p>
        <button onclick="logout()" style="padding:10px 20px;background:#6A0000;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">Çıxış</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }
  
  function showNoLicenseMessage(centerName){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:32px;max-width:380px;text-align:center">
        <div style="font-size:32px;margin-bottom:12px">🔒</div>
        <h2 style="margin:0 0 8px;color:#6A0000;font-size:20px">Lisenziya Tələb olunur</h2>
        <p style="margin:0 0 8px;color:#555;font-size:14px"><strong>${centerName}</strong></p>
        <p style="margin:0 0 20px;color:#777;font-size:13px">Bu alətə lisenziya verilməyib. Admin-a müraciət edin.</p>
        <button onclick="logout()" style="width:100%;padding:10px;background:#6A0000;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">Çıxış</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }
  
  function unlockContent(){
    document.body.style.overflow = 'auto';
  }
  
  window.logout = function(){
    localStorage.removeItem('currentUser');
    window.location.href = 'https://samir210-az.github.io/menyu/login.html';
  };
})();
