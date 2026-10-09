// Launching a coin on pump.fun.
//   1. Pin the image + metadata to IPFS through pump.fun.
//   2. Ask PumpPortal for a "create" transaction for a fresh mint keypair.
//   3. Co-sign with the mint key, then have Phantom sign and send it.
import { Buffer } from 'buffer';
import { getProvider } from './wallet.js';

if (!window.Buffer) window.Buffer = Buffer;

const RPC = import.meta.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com';

export async function uploadMetadata({ name, ticker, description, file, twitter = '', telegram = '', website = '' }) {
  const form = new FormData();
  form.append('file', file);
  form.append('name', name);
  form.append('symbol', ticker);
  form.append('description', description);
  form.append('twitter', twitter);
  form.append('telegram', telegram);
  form.append('website', website);
  form.append('showName', 'true');
  const res = await fetch('https://pump.fun/api/ipfs', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Could not upload your coin art to IPFS. Try again in a moment.');
  const json = await res.json();
  if (!json.metadataUri) throw new Error('pump.fun did not return a metadata link. Try again.');
  return json.metadataUri;
}

export async function createOnPumpFun({ name, ticker, metadataUri, devBuySol = 0, onStep = () => {} }) {
  const provider = getProvider();
  if (!provider?.publicKey) throw new Error('Connect Phantom before launching.');
  const { Keypair, VersionedTransaction } = await import('@solana/web3.js');

  onStep('build');
  const mintKeypair = Keypair.generate();
  const res = await fetch('https://pumpportal.fun/api/trade-local', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: provider.publicKey.toString(),
      action: 'create',
      tokenMetadata: { name, symbol: ticker, uri: metadataUri },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: 'true',
      amount: devBuySol,
      slippage: 10,
      priorityFee: 0.0005,
      pool: 'pump',
    }),
  });
  if (!res.ok) throw new Error('pump.fun could not build the launch transaction. Check your settings and try again.');
  const tx = VersionedTransaction.deserialize(new Uint8Array(await res.arrayBuffer()));
  tx.sign([mintKeypair]);

  onStep('sign');
  const { signature } = await provider.signAndSendTransaction(tx);

  onStep('confirm');
  try {
    const { Connection } = await import('@solana/web3.js');
    await new Connection(RPC, 'confirmed').confirmTransaction(signature, 'confirmed');
  } catch { /* the signature is final enough to link to */ }

  return { signature, mint: mintKeypair.publicKey.toBase58() };
}
