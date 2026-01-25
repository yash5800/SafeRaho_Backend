import * as bip39 from "bip39";

const htmlTemplate = (words, userGmail) => `
<style>
  :root {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --muted: #475569;
    --border: #e5e7eb;
    --primary: #2563eb;
    --accent-soft: #eef2ff;
    --success-soft: #ecfdf5;
    --success-border: #86efac;
    --danger-soft: #fff7ed;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 48px 20px;
  }

  .page {
    max-width: 760px;
    margin: auto;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 48px;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;
  }

  .logo-title {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .logo-title h1 {
    font-size: 26px;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .logo-title span {
    font-size: 13px;
    color: var(--muted);
  }

  .user-email {
    font-size: 18px;
    color: var(--muted);
    word-break: break-all;
    color: var(--primary);
    font-weight: 500;
  }

  h2 {
    font-size: 18px;
    margin-top: 36px;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  p {
    font-size: 14px;
    line-height: 1.7;
    color: var(--muted);
    margin: 0;
  }

  /* Recovery Phrase */
  .phrase-section {
    margin-top: 20px;
    padding: 24px;
    border-radius: 14px;
    background: var(--accent-soft);
    border: 1px dashed #c7d2fe;
  }

  .phrase {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 16px;
  }

  .phrase span {
    padding: 10px 12px;
    border-radius: 10px;
    background: #ffffff;
    border: 1px solid var(--border);
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  }

  /* Info blocks */
  .info-box {
    margin-top: 24px;
    padding: 20px 22px;
    border-radius: 14px;
    background: var(--success-soft);
    border: 1px solid var(--success-border);
  }

  .info-box h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #047857;
  }

  .storage-tips {
    margin: 0;
    padding-left: 18px;
    font-size: 14px;
    color: #065f46;
  }

  .storage-tips li {
    margin-bottom: 8px;
  }

  /* Footer */
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    font-size: 12px;
    color: #64748b;
    text-align: center;
  }
</style>

<div class="page">
  <div class="header">
    <div class="logo-title">
      <h1>Recovery kit</h1>
      <span>Keep this document safe</span>
    </div>
    <div class="user-email">${userGmail}</div>
  </div>

  <h2>Recovery phrase</h2>
  <p>
    If you get locked out of your account, this phrase lets you recover access and data.
  </p>

  <div class="phrase-section">
    <div class="phrase">
      ${words.map(w => `<span>${w}</span>`).join("")}
    </div>
  </div>

  <h2>Why this matters</h2>
  <p>
    Due to strong encryption, nobody — not even us — can access your account without this phrase.
    Losing it may permanently lock your data.
  </p>

  <div class="info-box">
    <h3>Safe storage tips</h3>
    <ul class="storage-tips">
      <li>Write it down and store it in a secure location.</li>
      <li>Use an encrypted password manager for digital storage.</li>
      <li>Avoid screenshots or cloud photos.</li>
      <li>Never share this phrase with anyone.</li>
    </ul>
  </div>

  <div class="footer">
    Created on ${new Date().toLocaleDateString()} by SafeRaho
  </div>
</div>
`;

const recoveryGenerator = (email)=>{
  const mnemonic = bip39.generateMnemonic(128);
  const words = mnemonic.split(" ");
  return htmlTemplate(words, email);
}

export { recoveryGenerator };