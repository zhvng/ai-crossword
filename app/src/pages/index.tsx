import type { NextPage } from "next";
import Head from "next/head";
import { HomeView, MiniView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>AI Crossword</title>
        <meta
          name="description"
          content="AI generated crossword puzzles!"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
