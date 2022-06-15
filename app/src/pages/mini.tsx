import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { MiniView } from "../views";

const Mini: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Mini Crossword</title>
        <meta
          name="description"
          content="AI generated 5x5 crosswords. Based on the NY Times mini crossword."
        />
      </Head>
      <MiniView />
    </div>
  );
};

export default Mini;
