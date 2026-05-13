export async function onRequestPost(context) {
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