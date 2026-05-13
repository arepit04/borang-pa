export async function onRequestPost(context) {
    try {
        // 1. Semak jika Database 'DB' berjaya diikat (Sangat penting!)
        if (!context.env.DB) {
            return new Response("DATABASE TIDAK DIJUMPAI! Sila semak fail wrangler.json anda.", { status: 500 });
        }

        // 2. Tangkap data dari borang HTML
        const data = await context.request.json();

        // 3. Hantar data ke dalam D1 Database
        const stmt = context.env.DB.prepare(
            "INSERT INTO form_submissions (name, phone, raw_data) VALUES (?, ?, ?)"
        ).bind(
            data.cert_holder_name || "Tiada Nama", 
            data.phone_mobile || "Tiada Nombor", 
            JSON.stringify(data)
        );

        await stmt.run();

        // 4. Balas kepada borang bahawa proses berjaya
        return new Response("Data berjaya disimpan!", { status: 200 });

    } catch (error) {
        // 5. Jika gagal, hantar mesej ralat TERUS TERANG supaya kita tahu.
        return new Response("RALAT D1: " + error.message, { status: 500 });
    }
}export async function onRequestPost(context) {
    try {
        // 1. Tangkap data dari borang HTML
        const data = await context.request.json();

        // 2. Hantar data ke dalam D1 Database
        // Perhatikan "context.env.DB" - kita akan pautkan 'DB' ini di dashboard nanti
        const stmt = context.env.DB.prepare(
            "INSERT INTO form_submissions (name, phone, raw_data) VALUES (?, ?, ?)"
        ).bind(
            data.cert_holder_name || "Tiada Nama", 
            data.phone_mobile || "Tiada Nombor", 
            JSON.stringify(data) // Ini menyimpan SEMUA data borang serentak
        );

        await stmt.run();

        // 3. Balas kepada borang bahawa proses berjaya
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
