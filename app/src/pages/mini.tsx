import type { NextPage } from "next";
import Head from "next/head";
import { MiniView } from "../views";

const Basics: NextPage = (props) => {
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

export default Basics;
