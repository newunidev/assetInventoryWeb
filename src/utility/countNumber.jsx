import { useEffect, useState } from "react";

const CountUpNumber = ({ value, duration = 3000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (end === 0) return;

    const incrementTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 2;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

export default CountUpNumber;
