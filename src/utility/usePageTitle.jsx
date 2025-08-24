// utility/usePageTitle.js
import { useState, useEffect } from "react";

let globalPageTitle = "Dashboard"; // initial title
let subscribers = [];

export function usePageTitle() {
  const [pageTitle, setPageTitle] = useState(globalPageTitle);

  useEffect(() => {
    subscribers.push(setPageTitle);

    return () => {
      subscribers = subscribers.filter((cb) => cb !== setPageTitle);
    };
  }, []);

  function setGlobalTitle(newTitle) {
    globalPageTitle = newTitle;
    subscribers.forEach((cb) => cb(newTitle));
  }

  return [pageTitle, setGlobalTitle];
}
