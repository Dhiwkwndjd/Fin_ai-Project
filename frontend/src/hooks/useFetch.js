import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);
    setError("");

    axiosInstance
      .get(url)
      .then((response) => {
        if (!isCancelled) setData(response.data);
      })
      .catch((requestError) => {
        if (!isCancelled) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [url, reloadCounter]);

  function reload() {
    setReloadCounter(reloadCounter + 1);
  }
  return { data, isLoading, error, reload };
}
