# Dapur Arab 🍲

**Masak dulu, paham kemudian.**  
Game memasak sederhana untuk belajar kosakata bahasa Arab lewat tindakan.

## Fitur yang sudah tersedia

- Beranda dengan tiga resep: Salad Ceria, Telur Goreng, dan Teh Mint.
- Resep terbuka secara bertahap setelah resep sebelumnya berhasil diselesaikan.
- Instruksi Arab yang setiap katanya dapat diklik untuk melihat arti dan cara baca.
- Pembacaan teks Arab menggunakan fitur Text-to-Speech browser jika didukung.
- Drag-and-drop dan mode ketuk untuk HP.
- Timer, penghitung kesalahan, indikator gosong, petunjuk, dan penilaian 1–3 bintang.
- Mode menantang yang menyembunyikan nama bahan dalam bahasa Arab.
- Buku Catatan Koki untuk kata yang pernah dibuka.
- Papan peringkat lokal pada browser/perangkat yang sama.
- Progres disimpan dengan `localStorage`; tidak perlu login server.
- Responsif untuk HP, tablet, dan laptop.

## 1. Menjalankan di komputer

Prasyarat: Node.js versi LTS yang masih didukung dan npm.

1. Ekstrak ZIP ini.
2. Buka folder `dapur-arab` di VS Code.
3. Buka terminal pada folder proyek.
4. Jalankan:

   ```bash
   npm install
   npm run dev
   ```

5. Buka URL lokal yang ditampilkan Vite, biasanya `http://localhost:5173`.

Untuk mengecek build produksi:

```bash
npm run build
npm run preview
```

Hasil build berada di folder `dist/`.

## 2. Upload ke GitHub

1. Buat repository baru di GitHub, misalnya `dapur-arab`.
2. Jangan tambahkan README dari GitHub jika README proyek ini sudah ada, atau selesaikan konflik jika memilih membuat README di GitHub.
3. Buka terminal di folder proyek dan jalankan:

   ```bash
   git init
   git add .
   git commit -m "Build Dapur Arab learning game"
   git branch -M main
   git remote add origin https://github.com/USERNAME/dapur-arab.git
   git push -u origin main
   ```

4. Ganti `USERNAME` dengan username GitHub milikmu.
5. Jika Git meminta autentikasi, ikuti metode login GitHub yang tersedia di komputermu.

Alternatif tanpa terminal: buka repository GitHub, pilih **Add file → Upload files**, lalu unggah isi folder proyek. Jangan unggah folder `node_modules` atau `dist`.

## 3. Deploy ke Netlify

1. Login ke Netlify.
2. Pilih **Add new site → Import an existing project**.
3. Hubungkan akun GitHub dan pilih repository `dapur-arab`.
4. Pastikan pengaturan build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Klik **Deploy site**.
6. Setelah deployment selesai, buka URL Netlify yang diberikan.
7. Setiap kali perubahan di-push ke branch produksi, Netlify akan membangun ulang website secara otomatis.

Konfigurasi build dan fallback halaman sudah disiapkan pada `netlify.toml`.

## 4. Cara bermain

1. Buka resep yang tidak terkunci.
2. Baca perintah Arab pada kertas resep.
3. Klik kata Arab untuk melihat arti dan cara baca. Tombol suara mencoba membacakan kata atau kalimat.
4. Pilih bahan yang sesuai, lalu ketuk talenan atau wadah yang tepat. Di komputer, bahan juga dapat diseret.
5. Selesaikan semua langkah sebelum waktu habis.
6. Tiga kesalahan atau waktu habis membuat misi gagal.
7. Mulai dengan tiga bintang. Dua kesalahan atau lebih mengurangi satu bintang. Dua bantuan atau lebih mengurangi satu bintang.
8. Resep berikutnya terbuka setelah resep sebelumnya berhasil diselesaikan.

## 5. Catatan penting tentang login dan peringkat

Versi ini sengaja dibuat tanpa backend agar mudah dipublikasikan dan langsung dapat dimainkan. Form profil hanya menyimpan nama pemain di browser. Progres, Buku Catatan, dan peringkat juga disimpan secara lokal.

Konsekuensinya:
- Data tidak otomatis berpindah ke perangkat lain.
- Menghapus data situs/browser dapat menghapus progres.
- Papan peringkat bukan papan peringkat online lintas pengguna.

Jika ingin akun sungguhan dan papan peringkat online, tahap berikutnya adalah menghubungkan Supabase (Auth + database) dan menerapkan Row Level Security. Jangan memasukkan kunci `service_role` Supabase ke frontend. Untuk aplikasi publik, validasi skor sebaiknya dilakukan di server agar papan peringkat lebih sulit dimanipulasi.

## 6. Struktur proyek

```text
dapur-arab/
├── public/
│   └── _redirects
├── src/
│   ├── data/
│   │   └── recipes.js
│   ├── utils/
│   │   └── storage.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── netlify.toml
├── package.json
├── vite.config.js
└── README.md
```

## 7. Mengubah konten resep

Data bahan, instruksi, terjemahan, dan langkah resep ada di `src/data/recipes.js`. Setiap langkah memiliki:
- `arabic`: kalimat Arab.
- `translation`: terjemahan kalimat.
- `words`: arti dan transliterasi tiap kata.
- `ingredient`: ID bahan yang benar.
- `quantity`: jumlah bahan yang harus dipilih.
- `target`: `board` atau `vessel`.
- `hint`: teks petunjuk.

Saat menambah resep, tambahkan ID bahan yang tersedia di objek `ingredients`, lalu masukkan resep baru ke array `recipes`.

## Batasan versi awal

- Suara menggunakan Text-to-Speech bawaan browser. Ketersediaan suara Arab bergantung pada perangkat/browser.
- Akurasi harakat, transliterasi, dan terjemahan sebaiknya diperiksa oleh pengajar bahasa Arab sebelum dipakai sebagai materi resmi.
- Animasi dan ilustrasi dibuat menggunakan CSS dan emoji sehingga proyek tidak bergantung pada file gambar eksternal.
