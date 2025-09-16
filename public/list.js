import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://crrrqcjgxzkcwejyaori.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycnJxY2pneHprY3dlanlhb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjYzMTEsImV4cCI6MjA3MzAwMjMxMX0.RY2NcjddyNESvaa6vCXQzJfUXJeQVvw3juWdO1Dfhk4"
);

const tbody = document.getElementById("ticket-list");

// チケット一覧を描画
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
    btn.disabled = ticket.called;

    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "送信中...";

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
            body: `整理番号 ${ticket.id} の方、2-6へお越しください。`
          })
        });

        if (!res.ok) throw new Error("送信失敗");

        alert(`整理番号 ${ticket.id} に通知しました`);
        //await supabase.from("tickets").update({ called: true }).eq("id", ticket.id);
        const { data: updated, error } = await supabase
          .from("tickets")
          .update({ called: true }, { returning: "representation" })
          .eq("id", ticket.id);

        if (error) console.error("Update failed:", error);
        else console.log("Updated ticket:", updated);

        renderTickets(); // 更新後の状態を反映
      } catch (err) {
        alert("通知送信に失敗しました");
        btn.disabled = false;
        btn.textContent = "呼び出し";
      }
    });

    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);
    tbody.appendChild(tr);
  });
}

// 初回描画 + 5秒ごとに更新
renderTickets();
setInterval(renderTickets, 5000);

