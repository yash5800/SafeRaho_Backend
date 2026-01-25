import express from "express";
import * as bip39 from "bip39";

const app = express();

const userGmail = "ffjokerking580@gmail.com";

const recoveryGenerator = (email)=>{
  const mnemonic = bip39.generateMnemonic(128);
  const words = mnemonic.split(" ");
  return htmlTemplate(words)
}

app.get("/api/signup/recoverykeys", (req, res) => {
  const email = req.query.email;
  const generatedHtml = recoveryGenerator(email);
  res.setHeader('Content-Type', 'text/html').status(200).send({
    message: 'Recovery keys generated successfully.',
    data: generatedHtml
  });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
