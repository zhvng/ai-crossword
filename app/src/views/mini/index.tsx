
import { FC } from "react";
import { MiniCrossword } from "components/MiniCrossword";

export const MiniView: FC = ({ }) => {

  return (
  <div className="md:hero mx-auto p-4 max-w-lg" style={{minWidth: '28rem'}}>
      <div className="md:hero-content flex flex-col w-full">
        {/* CONTENT GOES HERE */}
        <div className="text-center w-full">
          <MiniCrossword></MiniCrossword>
        </div>
      </div>
    </div>
  );
};
