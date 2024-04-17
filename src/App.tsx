import { useState, useEffect } from 'react'
import { Connection, PublicKey } from '@solana/web3.js';
import './App.css'
import {getAssociatedTokenAddress} from '@solana/spl-token';

const CHEESE = new PublicKey('AbrMJWfDVRZ2EWCQ1xSCpoVeVgZNpq1U2AoYG98oRXfn');
const CHEESE_COLOR = '#fcba03';

const WIDTH = 460;
const HEIGHT = 280;

function App() {
  const [isConnected, setConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const handleWalletConnect = async () => {

    const network = 'https://mainnet.helius-rpc.com/?api-key=a769a00e-2047-4cf5-bd06-60535321aadc';
    const connection = new Connection(network);

    /* @ts-ignore */
    const walletPublicKey = new PublicKey(window.solana.publicKey.toString());

    const tokenAccount = await getAssociatedTokenAddress(CHEESE, walletPublicKey);

    let { value } = await connection.getTokenAccountBalance(tokenAccount);
    setTokenBalance(value.amount / 1e6);
  };

  const connectWallet = () => {
    if ('solana' in window) {
      /* @ts-ignore */
      window.solana.connect().then(() => {
        handleWalletConnect();
        setConnected(true);
      });
    }
  };

  useEffect(() => {
    let canvas = document.getElementById('card');
    console.log(canvas);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const ratio = devicePixelRatio;

      canvas.style.width = `${WIDTH}px`;
      canvas.width = WIDTH * ratio;

      canvas.style.height = `${HEIGHT}px`;
      canvas.height = HEIGHT * ratio;

      ctx.scale(devicePixelRatio, devicePixelRatio);
      
      ctx.clearRect(0,0,WIDTH,HEIGHT);

      console.log(ctx);
      ctx.strokeStyle = 'black';

      const MARGIN = 5;

      let roundedCheeseValue = '';

      if (tokenBalance > 1e6) {
        // Millions
        roundedCheeseValue = Math.floor(tokenBalance / 1e6) + 'M';
      } else if (tokenBalance > 1e3) {
        // Thousands
        roundedCheeseValue = Math.floor(tokenBalance / 1e3) + 'M';
      } else {
        // Singles
        roundedCheeseValue = tokenBalance;
      }

      ctx.beginPath();
      ctx.roundRect(0.5 + MARGIN, 0.5 + MARGIN, WIDTH - MARGIN*2, 30, 10);
      ctx.rect(0.5 + MARGIN, 10.5, WIDTH - MARGIN*2, 40, 10);
      ctx.fillStyle = CHEESE_COLOR;
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(0.5 + MARGIN, 0.5 + MARGIN, WIDTH - MARGIN*2, HEIGHT - MARGIN*2, 10);
      ctx.stroke();

      ctx.font = '36px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText( roundedCheeseValue + ' $CHEESE', 20.5, HEIGHT - 20.5 );

      ctx.font = 'italic bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText( '$CHEESE CLUB MEMBERSHIP CARD', 14.5, 36.5);
    }
  });

  useEffect(() => {
    if ('solana' in window) {
      /* @ts-ignore */
      window.solana.connect({ onlyIfTrusted: true }). then(() => {
        handleWalletConnect();
        setConnected(true);
      });
    }
  }, []);

  if (!isConnected) {
    return (
      <button onClick={connectWallet} >Connect Wallet</button>
    );
  } else if (tokenBalance != null) { 
    return (
      <canvas id="card" />
    )
  }
}

export default App
