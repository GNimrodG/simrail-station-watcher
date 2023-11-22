import LinearProgress from "@mui/material/LinearProgress";
import { useState, type FunctionComponent, useEffect } from "react";

export interface UpdateIndicatorProps {
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  updateInterval: number;
}

const UpdateIndicator: FunctionComponent<UpdateIndicatorProps> = ({
  dataUpdatedAt,
  updateInterval,
  errorUpdatedAt,
}) => {
  const [updateProgress, setUpdateProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateProgress(
        ((Date.now() - Math.max(dataUpdatedAt, errorUpdatedAt)) / (updateInterval || 15000)) * 100
      );
    }, 200);

    return () => clearInterval(interval);
  }, [dataUpdatedAt, errorUpdatedAt, updateInterval]);

  return (
    <LinearProgress
      color={errorUpdatedAt > dataUpdatedAt ? "error" : "success"}
      variant={updateProgress > 100 ? "indeterminate" : "buffer"}
      value={updateProgress}
      valueBuffer={updateProgress}
    />
  );
};

export default UpdateIndicator;
