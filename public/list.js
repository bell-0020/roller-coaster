import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://crrrqcjgxzkcwejyaori.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycnJxY2pneHprY3dlanlhb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjYzMTEsImV4cCI6MjA3MzAwMjMxMX0.RY2NcjddyNESvaa6vCXQzJfUXJeQVvw3juWdO1Dfhk4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadTickets() {
  const ul = document.getElementById("ticket-list");
  const { data, error } = await supabase
    .from("tickets")
    .select("id, created_at")
    .order("id");

  if (error) {
    ul.innerHTML = "<li>読み込み失敗</li>";
    return;
  }

  if (!data.length) {
    ul.innerHTML = "<li>整理券なし</li>";
    return;
  }

  ul.innerHTML = data.map(
    t => `<li>#${t.id} - ${new Date(t.created_at).toLocaleString()}</li>`
  ).join("");
}

loadTickets();
