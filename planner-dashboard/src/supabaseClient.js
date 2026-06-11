import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tgyfapyxtqqevxcmwyfv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneWZhcHl4dHFxZXZ4Y213eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTQxNzEsImV4cCI6MjA5NjM5MDE3MX0.t1Fx0matpgodQVARVYFhGIPo5NzCNBBkn11Nu658ABE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
