import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://crrrqcjgxzkcwejyaori.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycnJxY2pneHprY3dlanlhb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjYzMTEsImV4cCI6MjA3MzAwMjMxMX0.RY2NcjddyNESvaa6vCXQzJfUXJeQVvw3juWdO1Dfhk4"
);

const tbody = document.getElementById("ticket-list");

// チケット一覧を描画する関数
async function renderTickets() {
  const { data } = await supabase
    .from("tickets")
    .select("id, created_at, endpoint, p256dh, auth, called")
    .order("id", { ascending: true });

  tbody.innerHTML = "";

  data.forEach(ticket => {
    const tr = document.createElement("tr");

    // 番号
    const tdId = document.createElement("td");
    tdId.textContent = ticket.id;
    tr.appendChild(tdId);

    // 発行日時
    const tdDate = document.createElement("td");
    tdDate.textContent = new Date(ticket.created_at).toLocaleString();
    tr.appendChild(tdDate);

    // 呼び出しボタン
    const tdBtn = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = ticket.called ? "呼び出し済み" : "呼び出し";

    // ボタンCSS
    btn.style.padding = "6px 12px";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = ticket.called ? "not-allowed" : "pointer";
    btn.style.backgroundColor = ticket.called ? "#ccc" : "#4CAF50";
    btn.style.color = ticket.called ? "#666" : "#fff";

    btn.disabled = ticket.called;

    btn.addEventListener("click", async () => {
  // 無効化
      btn.disabled = true;
      btn.textContent = "送信中...";
      btn.style.backgroundColor = "#ccc";
      btn.style.cursor = "not-allowed";

      try {
        const res = await fetch("/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: {
              endpoint: ticket.endpoint,
              keys: { p256dh: ticket.p256dh, auth: ticket.auth }
        },
        title: "順番が来ました！",
        body: `整理番号 ${ticket.id} の方、受付へお越しください。`
        })
      });

      if (res.ok) {
        alert(`整理番号 ${ticket.id} に通知しました`);
        // DBのcalledをtrueに更新
        await supabase.from("tickets").update({ called: true }).eq("id", ticket.id);
      } else {
        alert("通知送信に失敗しました");
        // 失敗したら元に戻す
        btn.disabled = false;
        btn.textContent = "呼び出し";
        btn.style.backgroundColor = "#4CAF50";
        btn.style.cursor = "pointer";
        return;
      }
    } catch (err) {
      alert("通知送信でエラーが発生しました");
      btn.disabled = false;
      btn.textContent = "呼び出し";
      btn.style.backgroundColor = "#4CAF50";
      btn.style.cursor = "pointer";
      return;
    }

    // ボタン文言を呼び出し済みに更新
    btn.textContent = "呼び出し済み";
    btn.style.backgroundColor = "#ccc";
    btn.style.cursor = "not-allowed";
  });


    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);

    tbody.appendChild(tr);
  });
}

// 初回描画
renderTickets();

// 5秒ごとに最新状態に更新
setInterval(renderTickets, 5000);
