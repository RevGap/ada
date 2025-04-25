import React, { createContext, useState, useCallback } from "react";

export const VoiceContext = createContext({
  isListening: false,
  isMuted: true,
  toggleMute: () => {},
  startListening: () => {},
  stopListening: () => {},
});

// Utility: Convert e.g. 59°F -> 59 degrees Fahrenheit, 20°C -> 20 degrees Celsius
export function ttsFriendly(text) {
  if (!text) return text;
  // Replace e.g. 59°F or 59 °F with 59 degrees Fahrenheit
  text = text.replace(/(\d+)\s*°\s*F\b/gi, '$1 degrees Fahrenheit');
  // Replace e.g. 20°C or 20 °C with 20 degrees Celsius
  text = text.replace(/(\d+)\s*°\s*C\b/gi, '$1 degrees Celsius');
  // Optionally, just replace any degree symbol with "degrees"
  text = text.replace(/(\d+)\s*°/g, '$1 degrees');
  return text;
}

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);
  const startListening = useCallback(() => setIsListening(true), []);
  const stopListening = useCallback(() => setIsListening(false), []);

  return (
    <VoiceContext.Provider value={{ isListening, isMuted, toggleMute, startListening, stopListening }}>
      {children}
    </VoiceContext.Provider>
  );
};
