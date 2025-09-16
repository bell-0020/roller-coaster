import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://crrrqcjgxzkcwejyaori.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycnJxY2pneHprY3dlanlhb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjYzMTEsImV4cCI6MjA3MzAwMjMxMX0.RY2NcjddyNESvaa6vCXQzJfUXJeQVvw3juWdO1Dfhk4"
);

async function loadTickets() {
  const { data } = await supabase
    .from("tickets")
    .select("id, created_at, endpoint, p256dh, auth, called")
    .order("id", { ascending: true });

  const tbody = document.getElementById("ticket-list");
  tbody.innerHTML = "";

  data.forEach(ticket => {
    const tr = document.createElement("tr");

    // 番号
    const idTd = document.createElement("td");
    idTd.textContent = ticket.id;
    tr.appendChild(idTd);

    // 発行日時
    const dateTd = document.createElement("td");
    dateTd.textContent = new Date(ticket.created_at).toLocaleString();
    tr.appendChild(dateTd);

    // 呼び出しボタン
    const btnTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = ticket.called ? "呼び出し済み" : "呼び出し";
    btn.disabled = ticket.called;

    btn.addEventListener("click", async () => {
      // 通知送信
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

      if (res.ok) {
        alert(`整理番号 ${ticket.id} に通知しました`);
        // DBのcalledをtrueに更新
        await supabase
          .from("tickets")
          .update({ called: true })
          .eq("id", ticket.id);

        btn.textContent = "呼び出し済み";
        btn.disabled = true;
      } else {
        alert("通知送信に失敗しました");
      }
    });

    btnTd.appendChild(btn);
    tr.appendChild(btnTd);

    tbody.appendChild(tr);
  });
}

loadTickets();

