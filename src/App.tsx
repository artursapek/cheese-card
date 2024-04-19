import { useState, useEffect } from 'react'
import { Connection, PublicKey } from '@solana/web3.js';
import './App.css'
import {getAssociatedTokenAddress} from '@solana/spl-token';

const CHEESE = new PublicKey('AbrMJWfDVRZ2EWCQ1xSCpoVeVgZNpq1U2AoYG98oRXfn');

const JUPITER_URL = 'https://jup.ag/swap/SOL-' + CHEESE;

const WIDTH = 460;
const HEIGHT = 280;

function App() {
  return <>
    <RootLink />
    <CheeseApp />
    <Footer />
    </>
}

function RootLink() {
  return <>
    <a id="root-link" href="https://cheesed.me"><img src="/logo.jpg" />$cheese on Solana</a>
    </>
}

function Footer() {
  return <footer>
    <a target="_blank" href="https://dexscreener.com/solana/c4zht1fptb6clcukivhnnntxbfxyojq6x8hezpuexqvr">{CHEESE.toString()}</a>
  </footer>
}

function CheeseApp() {
  const [hasSolana, setHasSolana] = useState(false);
  const [isInitialized, setInitialized] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isConnected, setConnected] = useState(false);
  let [tokenBalance, setTokenBalance] = useState<number | null>(null);
  let [username, setUsername] = useState<string | null>(null);
  let [pfp, setPfp] = useState<HTMLImageElement | null>(null);

  const handleWalletConnect = async () => {

    const network = 'https://mainnet.helius-rpc.com/?api-key=a769a00e-2047-4cf5-bd06-60535321aadc';
    const connection = new Connection(network);

    /* @ts-ignore */
    const walletPublicKey = new PublicKey(window.solana.publicKey.toString());

    const tokenAccount = await getAssociatedTokenAddress(CHEESE, walletPublicKey);

    try {
      let resp = await connection.getTokenAccountBalance(tokenAccount);
      if (resp) {
        /* @ts-ignore */
        setTokenBalance(resp.value.amount / 1e6);
      }
    } catch (e) {
      setTokenBalance(null);
    }
    setLoading(false);
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
    let canvas: HTMLCanvasElement = document.querySelector('#card canvas')!;

    if (canvas && tokenBalance !== null) {
      let bg = new Image();
      bg.onload = () => {

        const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
        const ratio = devicePixelRatio;

        canvas.style.width = `${WIDTH}px`;
        canvas.width = WIDTH * ratio;

        canvas.style.height = `${HEIGHT}px`;
        canvas.height = HEIGHT * ratio;

        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        ctx.clearRect(0,0,WIDTH,HEIGHT);

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
          roundedCheeseValue = '' + tokenBalance;
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

        ctx.font = 'bold italic 16px Arial';
        ctx.fillText( 'PROOFOFCHEESE.COM', WIDTH - 14.5, 260);

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
        } else {
          ctx.strokeStyle = 'white';
          ctx.strokeRect(20, 70, 160, 160);
          ctx.font = '18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Upload image', 100, 155);
        }
      }

      bg.src = '/cheesebg.png';
    }

  });

  const download = (e: any) => {
    e.preventDefault();
    let canvas: HTMLCanvasElement = document.querySelector('canvas')!;
    var img = canvas.toDataURL('image/png');
    let link = document.createElement('a');
    link.download = 'PROOF_OF_CHEESE.PNG';
    link.href = img;
    link.click();
  };

  const downloadBanner = (e: any) => {
    e.preventDefault();
    let bg = new Image();
    bg.onload = () => {

      let canvas: HTMLCanvasElement = document.querySelector('canvas')!;
      let bannerCanvas: HTMLCanvasElement = document.createElement('canvas');
      bannerCanvas.style.width = '1500px';
      bannerCanvas.style.height = '500px';
      bannerCanvas.width = 1500;
      bannerCanvas.height = 500;
      let ctx = bannerCanvas.getContext('2d')!;
      ctx.drawImage(bg, 0, 0, 1500, 500);
      ctx.drawImage(canvas, 800, 50, WIDTH*1.4, HEIGHT*1.4);

      var img = bannerCanvas.toDataURL('image/png');
      let link = document.createElement('a');
      link.download = 'CHEESE_BANNER.PNG';
      link.href = img;
      link.click();
    };
    bg.src = `/bannerbg_${Math.ceil(Math.random()*3)}.png`;

  }

  useEffect(() => {

    const attemptToConnect = () => {
      /* @ts-ignore */
      window.solana.connect({ onlyIfTrusted: true }).then(() => {
        handleWalletConnect();
        setConnected(true);
        setInitialized(true);
      }).catch(() => {
        setConnected(false);
        setInitialized(true);
      });
    };

    if ('solana' in window) {
      setHasSolana(true);
      /* @ts-ignore */
      attemptToConnect();

      /* @ts-ignore */
      window.solana.on('accountChanged', (pk: PublicKey) => {
        if (pk) {
          setConnected(true);
          handleWalletConnect();
        } else {
          setConnected(false);
          attemptToConnect();
        }
      });
    } else {
      setHasSolana(false);
      setInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return null

  } else if (!hasSolana) {
    return <div>No Solana wallet detected. <a target="_blank" href="https://phantom.app/">Install Phantom</a> and then <a target="_blank" href={JUPITER_URL}>buy $cheese</a>!</div>

  } else if (!isConnected) {
    return (
      <>
      <h1>GOT $CHEESE?</h1>
      <button id="connect-wallet" onClick={connectWallet} >Connect Wallet</button>
      </>
    );

  } else if (isLoading) {

    return <div>Loading...</div>

  } else if (!tokenBalance) {

    return <div>
      <h1>NO $CHEESE DETECTED</h1>
      <a target="_blank" id="buy" href={JUPITER_URL}>BUY $CHEESE</a>
      </div>

  } else if (tokenBalance != null && tokenBalance > 0) { 
    return (
      <div id="card-maker">
        <div id="card">
          <canvas id="card" />
        </div>

        <div id="inputs">
          <h3>Create your cheese card</h3>
          <input type="file" accept="image/*" id="imagePicker" onChange={
            (e: any) => {
              console.log(e);

              const file = e.target.files[0]; // Get the file from the input
              if (file) {

                  const reader = new FileReader();
                  reader.onload = function(e) {
                    console.log(e);
                    const img = new Image(); // Create a new image
                    img.onload = function() {
                      setPfp(img);
                    };
                    /* @ts-ignore */
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
          <br />

          { (username && pfp) ? 
            <>
              <a href="#" className="download" onClick={download}>DOWNLOAD CARD</a>
              <a href="#" className="download" onClick={downloadBanner}>DOWNLOAD TWITTER BANNER</a>
              <br />
              <a className="share" target="_blank" href="https://t.me/sliceocheese">Share it in Telegram!</a>
              <a className="share" target="_blank" href="https://twitter.com/intent/post?text=my%20proof%20of%20cheese%20@dacheeseslice">Share it on Twitter!</a>
            </>
            : null}
        </div>
      </div>
    )
  }
}

export default App
