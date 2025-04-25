import React, { createContext, useState } from "react";

// VisionContext provides visionData (e.g., Flash₂.₅ outputs) to widgets
export const VisionContext = createContext({
  visionData: null,
  setVisionData: () => {},
});

export const VisionProvider = ({ children }) => {
  const [visionData, setVisionData] = useState(null);

  return (
    <VisionContext.Provider value={{ visionData, setVisionData }}>
      {children}
    </VisionContext.Provider>
  );
};
