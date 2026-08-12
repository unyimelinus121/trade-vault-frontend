export function getSocketOrigin() {
  const configuredOrigin = String(
    process.env.NEXT_PUBLIC_SOCKET_URL || "",
  ).replace(/\/$/, "");

  if (typeof window === "undefined") return configuredOrigin;
  if (!configuredOrigin) return window.location.origin;

  try {
    const configuredUrl = new URL(configuredOrigin);
    const localBackend = new Set(["localhost", "127.0.0.1"]).has(
      configuredUrl.hostname,
    );
    const pageIsOnLan = !new Set(["localhost", "127.0.0.1"]).has(
      window.location.hostname,
    );

    if (localBackend && pageIsOnLan) {
      configuredUrl.hostname = window.location.hostname;
      return configuredUrl.origin;
    }
  } catch {
    // An empty or relative value is returned unchanged below.
  }

  return configuredOrigin;
}

export function mergeMessages(current, additions) {
  const messagesById = new Map(current.map((message) => [message.id, message]));
  for (const message of additions) messagesById.set(message.id, message);
  return [...messagesById.values()].sort((first, second) => first.id - second.id);
}

export function mergeConversation(current, incoming) {
  if (!incoming.lastMessageAt) return current.filter((item) => item.id !== incoming.id);
  const index = current.findIndex((item) => item.id === incoming.id);
  const conversations = [...current];
  if (index >= 0) conversations[index] = incoming;
  else conversations.push(incoming);
  return conversations.sort((first, second) => {
    const firstTime = new Date(first.lastMessageAt || first.createdAt).getTime();
    const secondTime = new Date(second.lastMessageAt || second.createdAt).getTime();
    return secondTime - firstTime;
  });
}

export function playAdminNotification() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const gain = context.createGain();
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(980, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.13, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.21);
    oscillator.addEventListener("ended", () => context.close());
  } catch {
    // The visual notification remains available when a browser blocks audio.
  }
}
