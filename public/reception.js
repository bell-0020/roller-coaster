import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://crrrqcjgxzkcwejyaori.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycnJxY2pneHprY3dlanlhb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjYzMTEsImV4cCI6MjA3MzAwMjMxMX0.RY2NcjddyNESvaa6vCXQzJfUXJeQVvw3juWdO1Dfhk4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VAPID_PUBLIC_KEY = "BJYGAQgw2pA3xMk4yCKACorIMax3mtWYy6FDBdoJof-QiDqzZzImpkDEmuV0VghL007x6XdofSM3n8xSq7z3aE4";

// VAPID → Uint8Array 変換
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Push通知購読
async function subscribePush() {
  if (!("serviceWorker" in navigator)) {
    alert("このブラウザはService Workerに対応していません");
    return null;
  }
  const reg = await navigator.serviceWorker.register("/sw.js");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("通知が許可されませんでした");
    return null;
  }
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  return sub.toJSON();
}

// 最新番号取得
async function showNextNumber() {
  const { data, error } = await supabase
    .from("tickets")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    console.error(error);
    document.getElementById("now-number").textContent = "エラー";
    return;
  }

  const nextId = (data?.[0]?.id ?? 0) + 1;
  document.getElementById("now-number").textContent = nextId;
}

// 整理券取得
document.getElementById("get").addEventListener("click", async () => {
  const sub = await subscribePush();
  if (!sub) return;

  const { data, error } = await supabase
    .from("tickets")
    .insert([{
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth
    }])
    .select("id")
    .single();

  if (error) {
    console.error(error);
    alert("整理券の発行に失敗しました");
    return;
  }

  document.getElementById("now-number").textContent = data.id;
  document.getElementById("number-plain").textContent = "あなたの整理番号";
  document.getElementById("get").disabled = true;
  document.getElementById("get").textContent = "取得済み";
});

// 初期表示
showNextNumber();

