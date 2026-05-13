export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // 1. Jika ada request dari borang untuk hantar data (POST ke /api/submit)
        if (request.method === "POST" && url.pathname.includes("/api/submit")) {
            try {
                // Semak jika Database 'DB' dijumpai
                if (!env.DB) {
                    return new Response("RALAT KOD: Database D1 tidak bersambung.", { status: 500 });
                }

                // Ambil data dari borang
                const data = await request.json();

                // Masukkan data ke dalam laci (table) form_submissions
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
                // Tangkap jika laci (table) tak wujud atau ada ralat lain
                return new Response("RALAT DATABASE: " + error.message, { status: 500 });
            }
        }

        // 2. Jika pengguna cuma nak buka laman web biasa (index.html)
        return await env.ASSETS.fetch(request);
    }
}
