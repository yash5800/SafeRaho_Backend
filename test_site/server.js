const LOGIN_DATA = {
  accountId: 'ea23eed3-2cb7-4e50-ba46-878e9979c137',
  accountName: 'joker',
  email: 'joker@example.com',
  salt: 'XawraQqJzzn0VCsSEOfhtg',
  verifier: 'OTc0ZGE1MmEwNWI4MDVhYjk0ZGJkZGM2OTBjOWQ3NjZiMTgwYzY3NGYzZTcyYjljNWY5YmM0YzI5ODE3M2Y0MWQ2OTljMWVjZmI4ODBjZDYwYmIxMzljZTU2Mjc0MDNmNmRiZWM5NWE0OGFmYjA4YTY3NDZjZWM0ZjQ2MmJiMjc5NzA3ZjA1NDlmOGIwNTExYzI1NThlNzA4MTc1N2U3YjliY2NkMjY5NGIzZDU3YTY2ZDRhZDc4MDI5Y2I5ODQ5NzAzYjljNzQyZTZjYzQwYWIyOGJkMGJlNWU0MzQwYTYxNmQ1MjkwNTMwNTUxYzE0YTZhZDg0MzQ1MjUzZmY4NGEyZWZiMzJjMmYyMzQ1YmVmMjJkZWI5MjBjYTliYmY3MGU2NjkyMzRmMTdiZTkyODVhZGZmMGNiNWExOGQ4MTAxZmJhNWVmNGQ1YjY2OWM2Mjc0ZGRiMTE5MDU2YjRlY2M5YmY5OTdhMDI4ZDlmNDEzYjIwZTdjYmIyMWIxMjk4OGQ2ZWUxNzRkYjczYzdjYjdlNjc2ZDQ0NDZlM2QwMmZlYmZjNWIwMGY3NmZhOTk2MGY1NTViZWZjNzZkMWYyYjY4MGZiNzBiOWU2YWNhNjg2ZGE1MmNlNjM1NDAyMzM3YjQ5Y2M3MTY1MDczZTUzMWJjZWZmYTRlMmVmZTlmYjE'
}

const ClientEphemeral = {
  secret: '76a7a2a20d943562f4fff5a5fecc8dd2003bb9fe24f2f2520af99ed7d5767caa',
  public: '24dd58a77698f6c86860a8c03a2f90f438453fffd09cb4f3076e8576862825e5bfc3ff4a13ac5e33e9dd6a4420f24e0f8f3f8ba5846e32ca22a77fba9bf8e7f95a6e898c2856a61532238068159c6286dbcfacdf22c0738e2d0e16e1a8dfa26081cf0a701275524203ce21301746cf275578c65a29612f7db496fb25bef94ea60fdadf8eec8892410cb12944392cbef2427d3edc3462d747c0cfca71adbe7121bd0bf1c11c8e967025cf45f3827b5e093d3f502adf8c37fb65245bb67484685ab4e747f2579f1e15fbc329e96dbf0a566ec77ddbe9176efaddf64f981f5612627cab77c3f67e46ef241bc13fea10988692a94c46649f4bd6292fb32636c995c6'
}

import srp from 'secure-remote-password/client.js';

(async () => {

const serverEphemeral = srp.generateEphemeral(LOGIN_DATA.verifier);

console.log('Server Ephemeral:', serverEphemeral);

const ClientSession = {
  Key: "b9415dea173edc83046251e16be78d58c1a5c9cf687aaca28cada9f497edb392",
  proof: "f3fbae7020dc1e6053d912c7b6ef693c245b903023d9ec4b032424cac3a07a56"
};

const session = srp.deriveSession(
  serverEphemeral.secret,
  ClientEphemeral.public,
  LOGIN_DATA.salt,
  LOGIN_DATA.accountName,
  LOGIN_DATA.verifier,
  ClientSession.proof
)

console.log('Server Session Key:', session.key);
console.log('Server Session Proof:', session.proof);

})();