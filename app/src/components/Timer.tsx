import { FC, useEffect, useState } from 'react';

type TimerProps = {
  startingTimestamp: number;
  endingTimestamp: number | undefined;
}

export const Timer: FC<TimerProps> = ({ startingTimestamp, endingTimestamp}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(new Date().getTime() - startingTimestamp);
    }, 100);
    return () => clearInterval(interval);
  }, [startingTimestamp, setTimeElapsed]);
  
  return (
    <div>
      {(endingTimestamp === undefined ? timeElapsed / 1000 : 
        (endingTimestamp - startingTimestamp) / 1000
      ).toFixed(1)}
    </div>
  );
};
