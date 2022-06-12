import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';

require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <>
          <Head>
            <title>Solana Scaffold Lite</title>
          </Head>

          <div className="flex flex-col h-screen">
            <Component {...pageProps} />
          </div>
        </>
    );
};

export default App;
