export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // =========================================================
        // TUGAS A: Terima data dari borang (POST) - AWAM (Tanpa Kunci)
        // =========================================================
        if (request.method === "POST" && url.pathname.includes("/api/submit")) {
            try {
                if (!env.DB) return new Response("RALAT KOD: Database D1 tidak bersambung.", { status: 500 });
                const data = await request.json();
                const stmt = env.DB.prepare(
                    "INSERT INTO form_submissions (name, phone, raw_data) VALUES (?, ?, ?)"
                ).bind(
                    data.cert_holder_name || "Tiada Nama",
                    data.phone_mobile || "Tiada Nombor",
                    JSON.stringify(data)
                );
                await stmt.run();
                return new Response("Data berjaya disimpan!", { status: 200 });
            } catch (error) {
                return new Response("RALAT DATABASE: " + error.message, { status: 500 });
            }
        }

        // =========================================================
        // KAWALAN KESELAMATAN (LOGIN) UNTUK ADMIN PAGE & DATA API
        // =========================================================
        if (url.pathname.includes("/admin.html") || url.pathname.includes("/api/data")) {
            
            // 💡 SILA TUKAR USERNAME DAN PASSWORD ANDA DI SINI:
            const USERNAME = "admin";
            const PASSWORD = "PasswordRahsia123!"; 

            const authHeader = request.headers.get("Authorization");
            const expectedAuth = "Basic " + btoa(`${USERNAME}:${PASSWORD}`);

            // Jika tiada password atau salah, halau mereka!
            if (!authHeader || authHeader !== expectedAuth) {
                return new Response("Akses Ditolak. Anda tidak dibenarkan masuk.", {
                    status: 401,
                    headers: {
                        "WWW-Authenticate": 'Basic realm="Sila Masukkan Username dan Password"'
                    }
                });
            }
        }

        // =========================================================
        // TUGAS B: Berikan data kepada Admin Page (GET) - DILINDUNGI KUNCI
        // =========================================================
        if (request.method === "GET" && url.pathname.includes("/api/data")) {
            try {
                const { results } = await env.DB.prepare("SELECT * FROM form_submissions ORDER BY submitted_at DESC").all();
                return new Response(JSON.stringify(results), {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (error) {
                return new Response("Ralat baca data: " + error.message, { status: 500 });
            }
        }

        // =========================================================
        // TUGAS C: Papar Laman Web (index.html atau admin.html)
        // =========================================================
        return await env.ASSETS.fetch(request);
    }
}
