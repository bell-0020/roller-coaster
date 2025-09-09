import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

    const SUPABASE_URL = "https://crrrqcjgxzkcwejyaori.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycnJxY2pneHprY3dlanlhb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjYzMTEsImV4cCI6MjA3MzAwMjMxMX0.RY2NcjddyNESvaa6vCXQzJfUXJeQVvw3juWdO1Dfhk4";
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const VAPID_PUBLIC_KEY = "BJYGAQgw2pA3xMk4yCKACorIMax3mtWYy6FDBdoJof-QiDqzZzImpkDEmuV0VghL007x6XdofSM3n8xSq7z3aE4";

    // Push通知購読処理
    async function subscribePush() {
      if (!("serviceWorker" in navigator)) {
        alert("このブラウザはService Workerに対応していません");
        return null;
      }
      // Service Worker登録
      const reg = await navigator.serviceWorker.register("/sw.js");
      // 通知許可
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("通知が許可されませんでした");
        return null;
      }
      // 購読登録
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      return sub.toJSON();
    }

    // VAPID→Uint8Array変換
    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    // 整理券取得
    document.getElementById("get").addEventListener("click", async () => {
      const sub = await subscribePush();
      if (!sub) return;

      // データベース
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

      // 現在番号を表示
      document.getElementById("now-number").textContent = data.id;
    });