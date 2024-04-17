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
  let [tokenBalance, setTokenBalance] = useState<number | null>(null);
  let [username, setUsername] = useState<string | null>(null);
  let [pfp, setPfp] = useState(null);

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
    let canvas = document.querySelector('#card canvas');

    console.log(canvas);
    if (canvas && tokenBalance !== null) {


      let bg = new Image();
      bg.onload = () => {

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

        let roundedCheeseValue = '';
        let header = '';

        //tokenBalance = 403302;

        if (tokenBalance > 1e6) {
          // Millions
          roundedCheeseValue = Math.floor(tokenBalance / 1e6) + 'M';
          header = 'CERTIFIED $CHEESEILLIONAIRE';
        } else if (tokenBalance > 1e3) {
          // Thousands
          roundedCheeseValue = Math.floor(tokenBalance / 1e3) + 'K';
          header = 'STACKING $CHEESE LIKE HOMER';
        } else {
          // Singles
          roundedCheeseValue = tokenBalance;
          header = 'STACKING $CHEESE LIKE HOMER';
        }


        ctx.drawImage(bg, 0, 0, 660, 400);

        ctx.shadowColor = '#a76f00';
        ctx.shadowBlur=7;

        ctx.textAlign = 'right';
        ctx.font = 'bold italic 24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText( 'VERIFIED HOLDER', WIDTH - 14.5, 100);
        ctx.font = 'bold italic 32px Arial';
        ctx.fillText( roundedCheeseValue + ' $CHEESE', WIDTH - 14.5, 150);
        ctx.font = 'bold italic 24px Arial';
        ctx.fillText( 'AGING ON CHAIN', WIDTH - 14.5, 200);

        ctx.font = 'italic bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText( header, WIDTH/2, 36.5);

        if (username) {
          ctx.textAlign = 'left';
          ctx.fillText( username, 20, HEIGHT-20);
        }


        if (pfp) {
          ctx.drawImage(pfp, 20, 70, 160, 160);
        }
      }

      bg.src = '/public/cheesebg.png';
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
      <div id="card-maker">
        <div id="card">
          <canvas id="card" />
        </div>

        <div id="inputs">
          <input type="file" accept="image/*" id="imagePicker" onChange={
            (e) => {
              console.log(e);

              const file = event.target.files[0]; // Get the file from the input
              if (file) {

                  const reader = new FileReader();
                  reader.onload = function(e) {
                      console.log(e);
                      const img = new Image(); // Create a new image
                      img.onload = function() {
                        setPfp(img);
                      };
                    img.src = e.target.result;
                  };

                console.log(file);

                  reader.readAsDataURL(file); // Read the file as a data URL (base64)
              }

            }
          }/>
          <br />
          <input type="text" placeholder="@name" value={username || ''} onChange={(e) => {
            setUsername(e.target.value);
          }}/>
        </div>
      </div>
    )
  }
}

export default App
