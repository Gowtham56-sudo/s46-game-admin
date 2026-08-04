export const playSynthPreset = (preset: string, audioUrl?: string) => {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
    return;
  }
  
  // Basic implementation for synth preset if no audio URL is provided
  console.log(`Playing synth preset: ${preset}`);
};
