GITHUB PAGES + GOOGLE APPS SCRIPT

Arsitektur:
GitHub Pages = frontend/static HTML
Apps Script Web App = backend API
Google Sheets = penyimpanan hasil

PENTING:
Versi GitHub ini tidak memakai google.script.run.
Itu hanya tersedia pada HTML yang disajikan oleh Apps Script HTML Service.
Versi ini memakai:
- JSONP GET untuk cek nama dan status pengiriman.
- POST form ke doPost() melalui hidden iframe untuk mengirim hasil.
- Polling JSONP untuk memastikan hasil sudah tersimpan.

SETUP:
1. Buat Google Sheet baru.
2. Extensions -> Apps Script.
3. Paste Code.gs.
4. SPREADSHEET_ID sudah diisi dengan Google Sheet yang Anda kirim.
5. Jalankan setupSheets() sekali.
6. Deploy -> New deployment -> Web app.
7. Execute as: Me.
8. Atur akses sesuai kebutuhan.
9. Salin URL /exec.
10. Buka file UH:
    02_Ulangan_Harian/Ulangan_Harian_Informatika_XII_FaseF.html
11. Ganti:
    const APPS_SCRIPT_URL = 'URL Web App sudah tertanam di file UH';
    dengan URL /exec.
12. Commit ke GitHub dan aktifkan GitHub Pages.

JANGAN mengubah kunci jawaban di HTML.
Kunci server berada di Code.gs.

Catatan keamanan:
Nama dan jawaban siswa adalah data pribadi. Beri akses Google Sheet hanya kepada pihak yang perlu.
