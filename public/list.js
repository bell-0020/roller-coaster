import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://crrrqcjgxzkcwejyaori.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycnJxY2pneHprY3dlanlhb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjYzMTEsImV4cCI6MjA3MzAwMjMxMX0.RY2NcjddyNESvaa6vCXQzJfUXJeQVvw3juWdO1Dfhk4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadTickets() {
  const tbody = document.getElementById("ticket-list");
  tbody.innerHTML = "<tr><td colspan='2'>読み込み中...</td></tr>";

  const { data, error } = await supabase
    .from("tickets")
    .select("id, created_at")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    tbody.innerHTML = "<tr><td colspan='2'>読み込み失敗</td></tr>";
    return;
  }

  if (!data.length) {
    tbody.innerHTML = "<tr><td colspan='2'>整理券なし</td></tr>";
    return;
  }

  tbody.innerHTML = data.map(
    t => `
      <tr>
        <td>${t.id}</td>
        <td>${new Date(t.created_at).toLocaleString()}</td>
      </tr>
    `
  ).join("");
}

loadTickets();

