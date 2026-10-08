PORTFOLIO GHOZI ABDULLAH — HTML & CSS
=====================================

Cara membuka
------------
Ekstrak folder ini, lalu klik dua kali index.html (buka di Chrome/Edge/Firefox).
Font dimuat dari Google Fonts, jadi butuh koneksi internet agar tampilannya pas.

Isi folder
----------
index.html        -> semua konten (hero, about, portfolio, experience, organization, contact)
style.css         -> semua gaya tampilan
script.js         -> interaksi: animasi scroll, menu HP, klik gambar (lightbox), dll.
assets/img/       -> foto & gambar yang diambil dari PDF portofolio
assets/img/extra/ -> foto tambahan dari PDF yang belum dipakai (boleh dipakai/dihapus)

Mengubah tampilan
-----------------
- Warna: ubah variabel di bagian paling atas style.css (:root), misalnya --yellow.
- Kata besar di hero ("data stories") dan footer ("analyst") ada di index.html.
- Warna section gelap (ala X/Twitter Dim) ada di variabel --dark di :root.
- Detail pengalaman dibuka/tutup dengan tombol "Details".
- Semua foto di Projects, Experience, Organization, Volunteer, dan Certificates bisa diklik
  untuk diperbesar (pakai panah kiri/kanan atau geser di HP, Esc untuk menutup).
- Kalau script.js dihapus, website tetap tampil normal, hanya tanpa animasi.

Online-kan gratis
-----------------
Upload folder ini ke GitHub lalu aktifkan GitHub Pages, atau drag & drop foldernya ke
Netlify Drop (app.netlify.com/drop) / Vercel.
