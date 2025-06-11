const audios: HTMLAudioElement[] = [];

export function registerAudio(audio: HTMLAudioElement) {
  audios.push(audio);
}

export function stopAllAudios() {
  audios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}