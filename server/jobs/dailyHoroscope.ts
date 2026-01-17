import { wixHoroscopeService } from "../services/wixHoroscope";

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

export async function runDailyHoroscopeJob(): Promise<void> {
  if (isRunning) {
    console.log("[Daily Horoscope Job] Already running, skipping...");
    return;
  }

  isRunning = true;
  console.log("[Daily Horoscope Job] Starting daily horoscope generation...");

  try {
    const today = new Date().toISOString().split('T')[0];
    
    await wixHoroscopeService.generateDailyHoroscopes(today);
    console.log(`[Daily Horoscope Job] Successfully generated horoscopes for ${today}`);

    const sentCount = await wixHoroscopeService.sendDailyNotificationsToSubscribers();
    console.log(`[Daily Horoscope Job] Sent ${sentCount} push notifications to subscribers`);

  } catch (error) {
    console.error("[Daily Horoscope Job] Error:", error);
  } finally {
    isRunning = false;
  }
}

export function startDailyHoroscopeScheduler(): void {
  console.log("[Daily Horoscope Scheduler] Starting scheduler...");
  
  const runIfMidnight = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (hours === 0 && minutes === 0) {
      runDailyHoroscopeJob().catch(console.error);
    }
  };

  intervalId = setInterval(runIfMidnight, 60000);

  console.log("[Daily Horoscope Scheduler] Scheduler started. Will generate horoscopes at midnight.");
  
  const horoscopesExist = checkIfTodaysHoroscopesExist();
  horoscopesExist.then(exists => {
    if (!exists) {
      console.log("[Daily Horoscope Scheduler] No horoscopes for today, generating now...");
      runDailyHoroscopeJob().catch(console.error);
    }
  });
}

async function checkIfTodaysHoroscopesExist(): Promise<boolean> {
  try {
    const horoscopes = await wixHoroscopeService.getDailyHoroscopes();
    return horoscopes.length === 12;
  } catch {
    return false;
  }
}

export function stopDailyHoroscopeScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[Daily Horoscope Scheduler] Scheduler stopped.");
  }
}
