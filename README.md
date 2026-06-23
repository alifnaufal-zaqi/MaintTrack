# MaintTrack — Asset Movement & Maintenance System

> **Tagline:** _Kelola, Pantau, dan Lacak Aset Perusahaan Anda — Kapan Saja, Di Mana Saja._

Sistem manajemen aset berbasis web yang memungkinkan perusahaan untuk mencatat, memantau, dan mengelola aset secara terstruktur dan terintegrasi. Dibangun di atas arsitektur **Monolith Next.js (App Router)** yang bersifat _serverless-first_, dengan memanfaatkan **Supabase** sebagai backend-as-a-service untuk kebutuhan autentikasi, database, penyimpanan file, dan komunikasi realtime.

---

## 🚀 Tech Stack & Dependensi Utama

### Core Framework & Runtime

| Teknologi | Versi | Peran & Alasan Pemilihan |
|---|---|---|
| **Next.js** | `16.2.6` | Framework utama dengan App Router. Dipilih karena mendukung arsitektur _server component_, _server actions_, dan _middleware_ secara native — memungkinkan logika backend berjalan di edge tanpa server terpisah. |
| **React** | `19.2.4` | Library UI. Digunakan bersama Next.js untuk membangun antarmuka yang reaktif dan berbasis komponen. |
| **TypeScript** | `^5` | Superset JavaScript. Wajib digunakan untuk memastikan _type safety_ di seluruh lapisan aplikasi, mencegah bug runtime. |

### Backend-as-a-Service

| Teknologi | Versi | Peran & Alasan Pemilihan |
|---|---|---|
| **@supabase/supabase-js** | `^2.106.0` | Klien Supabase utama untuk interaksi database (PostgreSQL), autentikasi, dan Storage. |
| **@supabase/ssr** | `^0.10.3` | Paket khusus untuk menangani sesi autentikasi Supabase di lingkungan SSR (Server & Middleware) Next.js secara aman melalui _cookie-based session_. |

### State Management & Data Fetching

| Teknologi | Versi | Peran & Alasan Pemilihan |
|---|---|---|
| **@tanstack/react-query** | `^5.100.10` | Manajemen _server state_ dan caching data. Dipilih untuk mengelola siklus hidup data dari API (Supabase), meminimalkan _re-fetch_ yang tidak perlu, dan mendukung fitur _optimistic updates_. |
| **Zustand** | `^5.0.13` | Manajemen _global client state_ yang ringan dan minimalis. Digunakan untuk state yang perlu diakses lintas komponen tanpa prop-drilling, seperti data QR tag yang di-scan (`qr-store`). |
| **Axios** | `^1.16.1` | HTTP client untuk melakukan pemanggilan API Route eksternal jika diperlukan. |

### UI & Styling

| Teknologi | Versi | Peran & Alasan Pemilihan |
|---|---|---|
| **Tailwind CSS** | `^4` | Utility-first CSS framework. Dipilih untuk kecepatan styling yang konsisten dan efisien langsung di JSX. |
| **Shadcn UI** | `^4.7.0` | Koleksi komponen UI yang dibangun di atas Radix UI dan Tailwind CSS. Dipilih karena komponen-nya _accessible_, _headless_, dan dapat dikustomisasi penuh (kode diembed langsung ke proyek). |
| **Radix UI** | `^1.4.3` | Fondasi komponen primitif yang _accessible_ dan tidak memiliki styling bawaan, digunakan secara langsung oleh Shadcn UI. |
| **Lucide React** | `^1.17.0` | Library ikon SVG yang konsisten dan ringan. |
| **next-themes** | `^0.4.6` | Manajemen tema gelap/terang (Dark Mode) yang terintegrasi dengan Next.js. |
| **tw-animate-css** | `^1.4.0` | Utilitas animasi berbasis Tailwind CSS untuk _micro-animations_ yang halus. |

### Validasi & Form

| Teknologi | Versi | Peran & Alasan Pemilihan |
|---|---|---|
| **Zod** | `^4.4.3` | Validasi skema TypeScript-first. Digunakan bersama Next.js Server Actions (`useActionState`) untuk memvalidasi data form di sisi server sebelum dikirim ke database. |

### Visualisasi & Utilitas

| Teknologi | Versi | Peran & Alasan Pemilihan |
|---|---|---|
| **Recharts** | `^3.8.1` | Library charting berbasis React. Digunakan untuk visualisasi data (Bar Chart persebaran aset, Pie Chart status aset) di halaman Dashboard. |
| **jsQR** | `^1.4.0` | Library JavaScript murni untuk mendekode QR Code dari data gambar (ImageData). Digunakan dalam fitur pemindai QR berbasis kamera. |
| **qrcode.react** | `^4.2.0` | Komponen React untuk men-_generate_ gambar QR Code SVG/Canvas. Digunakan untuk mencetak/menampilkan QR tag setiap aset. |
| **react-dropzone** | `^15.0.0` | Hook untuk fungsionalitas drag-and-drop upload file. Diintegrasikan dengan Supabase Storage untuk upload gambar aset dan logo vendor. |
| **Sonner** | `^2.0.7` | Library notifikasi toast yang modern dan elegan. Digunakan sebagai sistem notifikasi UI global. |
| **class-variance-authority** | `^0.7.1` | Utilitas untuk membuat varian komponen UI yang aman dan tipe. |
| **clsx & tailwind-merge** | `^2.x / ^3.x` | Utilitas untuk menggabungkan class names secara kondisional dan aman (mencegah konflik class Tailwind). |

---

## 📦 Struktur Folder (Folder Structure)

Proyek ini mengikuti konvensi standar Next.js App Router dengan sumber kode terpusat di dalam direktori `src/`.

```
maint-track-app/
├── public/                      # Asset statis publik (favicon, gambar statis)
├── src/
│   ├── app/                     # ✅ Inti App Router Next.js
│   │   ├── actions/             # Server Actions global (login, logout, dll.)
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   ├── reset-password.ts
│   │   │   ├── update-profile.ts
│   │   │   └── create-category.ts
│   │   ├── auth/                # Grup rute untuk halaman autentikasi
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── dashboard/           # Grup rute utama setelah login (dilindungi middleware)
│   │   │   ├── layout.tsx       # Layout bersama: Sidebar, Header, Breadcrumb
│   │   │   ├── admin/           # Rute khusus peran ADMIN
│   │   │   │   ├── page.tsx     # Halaman Dashboard Admin (statistik, chart)
│   │   │   │   ├── master/      # Manajemen Data Master
│   │   │   │   │   ├── assets/          # CRUD Aset
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── create/
│   │   │   │   │   │   ├── [id]/        # Detail & Edit Aset
│   │   │   │   │   │   └── _ui/         # Komponen UI khusus halaman ini
│   │   │   │   │   ├── categories/      # CRUD Kategori
│   │   │   │   │   ├── locations/       # CRUD Lokasi
│   │   │   │   │   └── vendors/         # CRUD Vendor
│   │   │   │   ├── maintenances/        # Manajemen Maintenance
│   │   │   │   ├── movements/           # Manajemen Perpindahan Aset
│   │   │   │   ├── reports/             # Laporan
│   │   │   │   └── users/               # Manajemen Pengguna
│   │   │   └── operator/        # Rute khusus peran OPERATOR
│   │   │       ├── page.tsx     # Halaman Dashboard Operator
│   │   │       ├── assets/              # Lihat & Scan Aset
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/            # Detail Aset (untuk operator)
│   │   │       ├── maintenances/        # Pencatatan Maintenance
│   │   │       ├── movements/           # Pencatatan Perpindahan (via Scan QR)
│   │   │       └── notifications/       # Pusat Notifikasi
│   │   ├── globals.css          # Stylesheet global, variabel CSS & tema
│   │   ├── layout.tsx           # Root Layout (Providers, Font, Meta)
│   │   └── page.tsx             # Root page (redirect ke /auth/login)
│   │
│   ├── components/              # ✅ Komponen React yang dapat digunakan ulang
│   │   ├── commons/             # Komponen shared lintas fitur
│   │   │   ├── app-sidebar.tsx      # Navigasi sidebar utama (role-aware)
│   │   │   ├── camera.tsx           # Komponen pemindai QR via kamera
│   │   │   ├── bar-chart.tsx        # Komponen Bar Chart (Recharts)
│   │   │   ├── pie-chart.tsx        # Komponen Pie Chart (Recharts)
│   │   │   ├── statistic-card.tsx   # Kartu statistik dashboard
│   │   │   ├── pagination-button.tsx # Kontrol paginasi tabel
│   │   │   ├── field-input.tsx      # Input field dengan label & error
│   │   │   ├── field-select.tsx     # Select field dengan label & error
│   │   │   ├── dropzone-upload.tsx  # Komponen area upload file
│   │   │   ├── dark-mode-toggle.tsx # Toggle tema gelap/terang
│   │   │   ├── dashboard-breadcrumb.tsx # Breadcrumb navigasi dinamis
│   │   │   ├── action-button.tsx    # Tombol aksi dengan loading state
│   │   │   └── asset-barcode.tsx    # Komponen generate & tampil QR Code aset
│   │   ├── dropzone.tsx             # Komponen Dropzone generik (react-dropzone)
│   │   └── ui/                  # Komponen Shadcn UI (auto-generated)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── sidebar.tsx
│   │       ├── table.tsx
│   │       └── ... (dan lainnya)
│   │
│   ├── hooks/                   # ✅ Custom React Hooks
│   │   ├── use-mater-data.tsx   # Hook generik fetch data dari Supabase via React Query
│   │   ├── use-supabase-upload.ts # Hook upload file ke Supabase Storage
│   │   ├── use-pagination.tsx   # Hook manajemen state paginasi
│   │   ├── use-total-page.tsx   # Hook kalkulasi total halaman
│   │   ├── use-search.tsx       # Hook debounced search input
│   │   └── use-mobile.ts        # Hook deteksi ukuran layar mobile
│   │
│   ├── lib/                     # ✅ Library, konfigurasi, dan utilitas inti
│   │   ├── client.ts            # Inisialisasi Supabase client (browser)
│   │   ├── server.ts            # Inisialisasi Supabase client (server / RSC)
│   │   ├── supabase-admin.ts    # Inisialisasi Supabase Admin client (service role)
│   │   ├── middleware.ts        # Logika proteksi sesi pada Next.js middleware
│   │   ├── utils.ts             # Fungsi utilitas umum (cn, dll.)
│   │   └── stores/              # Zustand global state stores
│   │       ├── auth-store.ts    # Store data profil pengguna yang sedang login
│   │       └── qr-store.ts      # Store hasil scan QR tag antar-komponen
│   │
│   ├── providers/               # ✅ Context Providers React
│   │   ├── auth-provider.tsx    # Provider data autentikasi user ke client
│   │   ├── react-query-provider.tsx # Provider QueryClient untuk React Query
│   │   └── theme-provider.tsx   # Provider tema next-themes (dark/light)
│   │
│   ├── schemas/                 # ✅ Skema validasi Zod
│   │   ├── asset.ts             # Validasi form tambah/edit aset
│   │   ├── category.ts
│   │   ├── location.ts
│   │   ├── login.ts
│   │   ├── maintenance.ts
│   │   ├── movement.ts
│   │   ├── profile.ts
│   │   ├── user.ts
│   │   └── vendor.ts
│   │
│   ├── types/                   # ✅ Definisi TypeScript global
│   │   ├── asset.d.ts           # Tipe data Aset (Asset, FormAsset, MutationAsset)
│   │   ├── auth.d.ts            # Tipe data Autentikasi (Profile, AuthError)
│   │   ├── categories.d.ts
│   │   ├── locations.d.ts
│   │   ├── maintenance.d.ts
│   │   ├── movements.d.ts
│   │   ├── notifications.d.ts
│   │   ├── reports.d.ts
│   │   ├── users.d.ts
│   │   ├── vendor.d.ts
│   │   ├── form.d.ts            # Tipe generik FormState untuk Server Actions
│   │   ├── dialog-state.d.ts    # Tipe state dialog (open/close)
│   │   └── qrcode-react.d.ts    # Deklarasi tipe untuk library qrcode.react
│   │
│   ├── constants/               # ✅ Konstanta global aplikasi
│   ├── utils/                   # ✅ Fungsi utilitas tambahan
│   └── middleware.ts            # ✅ Entry point middleware Next.js
│
├── .env                         # Environment variables (JANGAN di-commit!)
├── .gitignore
├── components.json              # Konfigurasi Shadcn UI CLI
├── eslint.config.mjs            # Konfigurasi ESLint
├── next.config.ts               # Konfigurasi Next.js
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

### Penjelasan Folder Krusial

| Folder | Fungsi |
|---|---|
| `src/app/` | Inti dari Next.js App Router. Setiap folder merepresentasikan sebuah rute URL. Konvensi `_ui/` digunakan untuk menyimpan komponen yang hanya relevan untuk rute tersebut (tidak membuat rute baru). |
| `src/app/actions/` | Berisi **Next.js Server Actions** — fungsi async yang berjalan di server dan dapat dipanggil langsung dari komponen klien. Digunakan untuk mutasi data (login, create, update, delete). |
| `src/components/commons/` | Komponen shared yang digunakan di lebih dari satu fitur/halaman. Bukan komponen Shadcn UI, melainkan komponen bisnis yang lebih kompleks. |
| `src/hooks/` | Custom hooks yang mengabstraksi logika stateful dan side effects yang berulang agar dapat digunakan kembali. |
| `src/lib/` | Konfigurasi dan inisialisasi layanan eksternal (Supabase clients), middleware logic, dan Zustand stores. |
| `src/schemas/` | Skema Zod sebagai _single source of truth_ untuk aturan validasi data di seluruh aplikasi. |
| `src/types/` | Semua definisi tipe TypeScript global (`*.d.ts`). Berisi kontrak data antara frontend dan tabel-tabel di database. |

---

## ⚙️ Panduan Instalasi & Setup Lokal

### Prasyarat

Pastikan perangkat Anda telah terinstal:
- **Node.js** versi `18.x` atau lebih baru
- **npm** versi `9.x` atau lebih baru (atau `pnpm`/`yarn` sebagai alternatif)
- Akun **Supabase** yang aktif dengan proyek yang sudah dikonfigurasi
- **Git**

---

### Langkah 1: Kloning Repositori

```bash
git clone https://github.com/username/maint-track-app.git
cd maint-track-app
```

### Langkah 2: Instalasi Dependensi

```bash
npm install
```

> Perintah ini akan mengunduh dan menginstal semua dependensi yang terdaftar di `package.json`.

---

### Langkah 3: Konfigurasi Environment Variables

Buat file `.env` di root proyek berdasarkan template `.env.example` berikut:

```bash
# .env.example
# Salin file ini menjadi .env dan isi dengan nilai yang sesuai

# -----------------------------------------------------------------
# SUPABASE CONFIGURATION
# Dapatkan nilai ini dari: Supabase Dashboard > Project Settings > API
# -----------------------------------------------------------------

# URL proyek Supabase Anda
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co

# Publishable Key (aman digunakan di sisi klien/browser)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx

# Service Role Key (RAHASIA! Hanya untuk operasi admin di sisi server)
# JANGAN pernah mengekspos key ini ke sisi klien/browser
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxx
```

> **⚠️ PERINGATAN KEAMANAN:**
> File `.env` **WAJIB** didaftarkan di `.gitignore` dan **TIDAK BOLEH** di-push ke repositori publik. Variabel dengan prefix `NEXT_PUBLIC_` akan terekspos ke browser; pastikan hanya variabel yang memang dimaksudkan untuk publik yang diberi prefix tersebut.

**Cara Mendapatkan Kunci Supabase:**
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Pilih proyek Anda.
3. Navigasi ke **Project Settings** → **API**.
4. Salin nilai **Project URL** dan **Publishable Key**.

---

### Langkah 4: Menjalankan Server Pengembangan Lokal

```bash
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

Aplikasi akan otomatis melakukan hot-reload ketika terdapat perubahan pada file.

---

### Skrip NPM yang Tersedia

```bash
# Menjalankan server pengembangan dengan hot-reloading
npm run dev

# Membangun aplikasi untuk produksi (output ke folder .next/)
npm run build

# Menjalankan server produksi (setelah npm run build)
npm start

# Menjalankan ESLint untuk pengecekan kualitas kode
npm run lint
```

---

## 💎 Fitur Utama & Blueprints (Core Features)

### Fitur 1: Otentikasi, Otorisasi & Middleware Proteksi Role

Sistem keamanan diimplementasikan berlapis menggunakan Supabase Auth dan Next.js Middleware.

**Alur Teknis (Technical Flow):**

1. **Halaman Login** (`/auth/login`): Pengguna memasukkan email dan password melalui form yang terhubung ke Next.js Server Action `login()`.

2. **Validasi Schema (Server Action)**: Server Action `login.ts` menerima `FormData`, kemudian memvalidasinya menggunakan skema Zod (`LoginSchema`) sebelum melakukan operasi apapun.

```typescript
// src/app/actions/login.ts
const validatedFields = LoginSchema.safeParse({
  email: formData.get("email"),
  password: formData.get("password"),
});

if (!validatedFields.success) {
  return { errors: validatedFields.error.flatten().fieldErrors };
}
```

3. **Autentikasi Supabase**: Jika validasi berhasil, Server Action memanggil `supabase.auth.signInWithPassword()`. Supabase mengembalikan sesi pengguna yang disimpan otomatis dalam cookie HTTP-only oleh `@supabase/ssr`.

4. **Fetch Profil & Penentuan Role**: Setelah login berhasil, Server Action mengambil data profil pengguna dari tabel `user_profiles` menggunakan `user.id` sebagai kunci, lalu menyimpan profil ke cookie HTTP-only terpisah.

```typescript
// Menyimpan profil ke cookie setelah login sukses
cookieStore.set("profile", JSON.stringify(profile), {
  httpOnly: true,
  path: "/dashboard",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 365, // 1 tahun
});
```

5. **Redirect Berbasis Role**: Berdasarkan nilai `profile.role`, pengguna diredirect ke dashboard yang sesuai:
   - **`admin`** → `/dashboard/admin`
   - **`operator`** → `/dashboard/operator`

6. **Proteksi Middleware (Edge Layer)**: Setiap request ke seluruh halaman aplikasi (kecuali aset statis) dicegat oleh `src/middleware.ts`. Middleware memanggil `updateSession()` dari `src/lib/middleware.ts` yang:
   - Memvalidasi dan me-refresh session token Supabase dari cookie.
   - **Redirect ke `/auth/login`** jika pengguna tidak terautentikasi dan mencoba mengakses rute yang dilindungi.
   - Memastikan sesi selalu dalam keadaan segar (_fresh_) di setiap request.

```
[Browser] ──► Request ke /dashboard/admin
                │
                ▼
[Next.js Middleware] ── Cek cookie session Supabase via getClaims()
                │
                ├── (Sesi TIDAK valid) ──► Redirect ke /auth/login
                │
                └── (Sesi VALID) ──► Teruskan request ke Server Component
                                              │
                                              ▼
                                    [Server Component] ── Baca cookie "profile"
                                              │
                                              ▼
                                    Render halaman Admin / Operator
```

---

### Fitur 2: Manajemen Data Master (Aset, Lokasi, Vendor, Kategori)

Sistem CRUD lengkap untuk entitas data utama yang dikelola oleh Admin.

**Alur Teknis (Technical Flow) — Contoh: Tambah Aset Baru**

1. **Formulir Tambah Aset** (`/dashboard/admin/master/assets/create`): Admin mengisi form dengan detail aset (nama, kategori, vendor, lokasi, harga beli, dll.) dan meng-upload foto aset via komponen `Dropzone`.

2. **Upload Gambar ke Supabase Storage**: File gambar diupload menggunakan hook `useSupabaseUpload`. Hook ini menggunakan `react-dropzone` untuk interaksi drag-and-drop dan memanggil `supabase.storage.from(bucket).upload()`. Public URL dan path gambar disimpan bersama data aset.

```typescript
// Contoh penggunaan hook upload
const { onUpload, files, isSuccess } = useSupabaseUpload({
  bucketName: "assets",
  path: "images",
  allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  maxFileSize: 2 * 1024 * 1024, // 2MB
  upsert: false,
});
```

3. **Submit via Server Action**: Data form dikirim ke Server Action yang berjalan di server. Data divalidasi ulang menggunakan `AssetSchema.safeParse()` (validasi ganda untuk keamanan berlapis).

4. **Mutasi Database**: Server Action menggunakan Supabase Server Client (`createClient()` dari `lib/server.ts`) untuk mengeksekusi query insert ke tabel `assets` di PostgreSQL.

5. **Revalidasi Cache & Redirect**: Setelah insert berhasil, `revalidatePath()` dipanggil untuk membersihkan cache Next.js pada halaman daftar aset. Pengguna kemudian diredirect kembali ke halaman daftar.

**Alur Pengambilan Data (Read) dengan React Query:**

```typescript
// src/hooks/use-mater-data.tsx
// Hook generik yang dapat digunakan untuk SEMUA entitas master
// hanya dengan mengganti parameter `table` dan `key`
export function useMasterData<T>({ table, select, keyword, offset, key }) {
  const { data, isLoading } = useQuery({
    queryKey: [...key], // Cache key unik: ["assets", "list", page, keyword]
    queryFn: async () => {
      const query = supabase
        .from(table)
        .select(select, { count: "exact" })
        .order("created_at");

      if (offset) {
        query.range(offset.from, offset.to);
        query.ilike("name", `%${keyword}%`); // Pencarian fuzzy
      }

      const { data, error, count } = await query;
      if (error) toast.error("Gagal", { description: error.message });
      return { data: data as T, count };
    },
  });
  return { data, isLoading };
}
```

> React Query akan secara otomatis melakukan **caching** berdasarkan `queryKey`, sehingga request yang sama tidak diulang selama data masih valid. Ketika data berhasil di-mutasi, cache di-invalidasi menggunakan `queryClient.invalidateQueries()` agar UI selalu menampilkan data terbaru.

---

### Fitur 3: Pemindai QR Code via Kamera (Scanner)

Fitur krusial yang memungkinkan Operator mengidentifikasi aset secara cepat menggunakan kamera perangkat.

**Alur Teknis (Technical Flow):**

1. **Akses Kamera**: Komponen `<Camera />` (`src/components/commons/camera.tsx`) menggunakan Web API `navigator.mediaDevices.getUserMedia()` untuk meminta izin akses kamera. Pengguna dapat memilih antara kamera depan (`user`) atau kamera belakang (`environment`).

2. **Streaming Video**: Feed kamera di-_stream_ ke elemen `<video>` di dalam komponen. Komponen ini bersifat _client-only_ (`"use client"`).

3. **Pemindaian Frame Realtime**: Loop `requestAnimationFrame` berjalan terus menerus. Setiap frame video digambar ke elemen `<canvas>` tersembunyi, kemudian `ImageData` pixel-nya diekstrak menggunakan `CanvasRenderingContext2D.getImageData()`.

4. **Dekode QR dengan jsQR**: Data pixel dikirimkan ke fungsi `jsQR()`. Library ini mendeteksi dan mendekode pola QR Code dalam gambar.

```typescript
// src/components/commons/camera.tsx
const code = jsQR(imageData.data, imageData.width, imageData.height, {
  inversionAttempts: "dontInvert",
});

if (code) {
  const now = Date.now();
  const cooldownPeriod = 3000; // 3 detik cooldown

  // Cegah trigger ganda untuk QR yang sama
  if (
    code.data !== lastScannedCode.current ||
    now - lastScannedTime.current > cooldownPeriod
  ) {
    lastScannedCode.current = code.data;
    lastScannedTime.current = now;

    toast.success(`Aset Ditemukan: ${code.data}`);
    onQrTagChange(code.data); // Callback ke parent component
  }
}
```

5. **Cooldown Mekanisme**: Mekanisme cooldown 3 detik menggunakan `useRef` mencegah trigger ganda saat kamera terus menangkap QR yang sama.

6. **State Global via Zustand**: Hasil scan (`code.data`) diteruskan ke komponen parent melalui prop `onQrTagChange`. State QR tag juga tersedia di **Zustand store** (`useQrStore`) untuk diakses oleh komponen lain (misal, mengisi form perpindahan aset secara otomatis).

7. **Cleanup Resource**: Saat komponen di-_unmount_, `requestAnimationFrame` dibatalkan dan semua track stream kamera dihentikan untuk mencegah memory leak.

```
[Kamera Perangkat]
      │
      ▼ (MediaStream via getUserMedia)
[Elemen <video>]
      │
      ▼ (requestAnimationFrame loop)
[<canvas> tersembunyi]  ──  drawImage(video)
      │
      ▼ (getImageData)
[jsQR(imageData)]  ── QR tidak ditemukan? ──► loop lagi
      │
      ▼ (QR Terdeteksi + Cooldown Check)
[onQrTagChange(code.data)]
      │
      ├──► [Zustand: useQrStore.setTag()]
      │
      └──► [Toast Notifikasi] + [Navigasi/Form Perpindahan]
```

---

### Fitur 4: Notifikasi & Manajemen State React Query

Sistem umpan balik pengguna yang responsif dan sinkronisasi data yang efisien.

**A. Notifikasi Toast dengan Sonner**

Semua umpan balik aksi pengguna (sukses, gagal) menggunakan library **Sonner** yang dikonfigurasi sebagai provider global di root layout.

```typescript
import { toast } from "sonner";

// Notifikasi sukses
toast.success(`Aset Ditemukan: ${code.data}`);

// Notifikasi error dengan deskripsi tambahan
toast.error("Akses Kamera Gagal", { description: error.message });

// Notifikasi informasi
toast.info("Notifikasi Baru", { description: "Ada pembaruan maintenance." });
```

**B. Caching & Invalidasi Cache dengan React Query**

React Query bertindak sebagai lapisan cache cerdas antara komponen UI dan Supabase. Setiap query diidentifikasi oleh `queryKey` yang unik dan hierarkis.

```typescript
// Cache key yang mencakup seluruh parameter filter untuk invalidasi yang presisi
const { data, isLoading } = useMasterData<Asset[]>({
  table: "assets",
  select: "id, name, status_asset, category(name), vendor(name)",
  offset: { from: (currentPage - 1) * 10, to: currentPage * 10 - 1 },
  keyword: searchQuery,
  key: ["assets", "list", currentPage, searchQuery], // Key unik per state
});

// Invalidasi seluruh cache "assets" setelah mutasi berhasil
queryClient.invalidateQueries({ queryKey: ["assets"] });
```

**C. Optimistic Updates (Pola yang Direkomendasikan)**

Untuk pengalaman pengguna yang lebih mulus, pola **Optimistic Update** dapat diterapkan. Perubahan UI ditampilkan segera sebelum respons server diterima.

```typescript
const mutation = useMutation({
  mutationFn: updateAssetStatus,
  onMutate: async (newStatus) => {
    // 1. Batalkan query yang mungkin sedang berjalan
    await queryClient.cancelQueries({ queryKey: ["assets", "list"] });

    // 2. Simpan snapshot data lama untuk rollback
    const previousAssets = queryClient.getQueryData(["assets", "list"]);

    // 3. Update cache secara optimistis (SEBELUM respons server kembali)
    queryClient.setQueryData(["assets", "list"], (old: Asset[]) =>
      old.map((asset) =>
        asset.id === newStatus.id
          ? { ...asset, status_asset: newStatus.status }
          : asset
      )
    );

    return { previousAssets };
  },
  onError: (_err, _vars, context) => {
    // 4. Rollback ke data lama jika server mengembalikan error
    queryClient.setQueryData(["assets", "list"], context?.previousAssets);
    toast.error("Gagal memperbarui status aset.");
  },
  onSettled: () => {
    // 5. Selalu invalidate untuk sinkronisasi final dengan server
    queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
  },
});
```

**D. Notifikasi Realtime dengan Supabase Realtime**

Halaman Notifikasi (`/dashboard/operator/notifications`) dapat dikonfigurasi untuk menerima notifikasi secara instan menggunakan Supabase Realtime Postgres Changes.

```typescript
// Contoh: subscribe ke perubahan INSERT pada tabel notifications
useEffect(() => {
  const supabase = createClient();

  const channel = supabase
    .channel("notifications-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications" },
      (payload) => {
        // Invalidasi cache notifikasi agar React Query refetch
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        // Tampilkan toast untuk notifikasi yang baru masuk
        toast.info(payload.new.title, {
          description: payload.new.description,
        });
      }
    )
    .subscribe();

  // Cleanup: berhenti berlangganan saat komponen unmount
  return () => {
    supabase.removeChannel(channel);
  };
}, [queryClient]);
```

---

## 🗄️ Desain Skema Database (Database Schema)

> Template di bawah ini disediakan sebagai panduan struktur. Silakan lengkapi detail kolom, tipe data, constraint, dan relasi sesuai dengan implementasi aktual di Supabase Anda.

### Diagram Relasi Entitas (ERD Overview)

```
[auth.users]  ──(1:1)──►  [user_profiles]
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
               [movements]  [maintenances]  [assets]
               (pic_id)     (created_by)       │
                                          ┌────┼────┐
                                          │    │    │
                                          ▼    ▼    ▼
                                     [categories] [vendors] [locations]
```

---

### Tabel: `user_profiles`

```sql
-- Profil pengguna, berelasi 1:1 dengan tabel auth.users milik Supabase
CREATE TABLE public.user_profiles (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    fullname           TEXT NOT NULL,
    email              TEXT NOT NULL UNIQUE,
    phone_number       TEXT,
    role               TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
    address            TEXT,
    photo_profile_url  TEXT,   -- Public URL dari Supabase Storage
    photo_profile_path TEXT,   -- Internal path di bucket Storage
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Tabel: `categories`

```sql
-- Kategori aset (misal: Elektronik, Furnitur, Kendaraan)
CREATE TABLE public.categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()

    -- TODO: Tambahkan kolom lain jika diperlukan (misal: description, icon)
);
```

---

### Tabel: `vendors`

```sql
-- Vendor / pemasok aset perusahaan
CREATE TABLE public.vendors (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    email        TEXT,
    phone_number TEXT,
    address      TEXT,
    logo_url     TEXT,   -- Public URL logo dari Supabase Storage
    logo_path    TEXT,   -- Internal path di bucket Storage
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()

    -- TODO: Tambahkan constraint UNIQUE pada kolom yang diperlukan
);
```

---

### Tabel: `locations`

```sql
-- Lokasi / ruangan tempat aset ditempatkan
CREATE TABLE public.locations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()

    -- TODO: Tambahkan kolom lain (misal: building, floor, description)
);
```

---

### Tabel: `assets` ⭐ (Tabel Utama)

```sql
-- Tabel aset utama
CREATE TABLE public.assets (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   TEXT NOT NULL,
    category_id            UUID NOT NULL REFERENCES public.categories(id),
    vendor_id              UUID NOT NULL REFERENCES public.vendors(id),
    current_location_id    UUID NOT NULL REFERENCES public.locations(id),
    purchase_price         NUMERIC(15, 2),
    purchase_date          DATE,
    qr_tag                 TEXT UNIQUE,  -- String unik yang di-encode ke QR Code
    status_asset           TEXT NOT NULL DEFAULT 'active'
                               CHECK (status_asset IN ('active', 'maintenance', 'nonactive', 'overdue')),
    maintenance_interval   INTEGER,       -- Interval maintenance dalam satuan hari
    last_maintenance_date  DATE,
    next_maintenance_date  DATE,          -- Idealnya dihitung via trigger: last_date + interval
    asset_image_url        TEXT,          -- Public URL gambar dari Supabase Storage
    asset_image_path       TEXT,          -- Internal path di bucket Storage
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()

    -- TODO: Pertimbangkan DB trigger untuk auto-update next_maintenance_date
    -- TODO: Pertimbangkan DB trigger atau cron job untuk auto-update status 'overdue'
);
```

---

### Tabel: `movements`

```sql
-- Riwayat perpindahan aset antar lokasi
CREATE TABLE public.movements (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id         UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    from_location_id UUID NOT NULL REFERENCES public.locations(id),
    to_location_id   UUID NOT NULL REFERENCES public.locations(id),
    pic_id           UUID NOT NULL REFERENCES public.user_profiles(id), -- Person In Charge
    movement_date    DATE NOT NULL,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()

    -- TODO: Tambahkan CHECK constraint: from_location_id <> to_location_id
);
```

---

### Tabel: `maintenances`

```sql
-- Riwayat dan jadwal maintenance aset
CREATE TABLE public.maintenances (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id         UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type TEXT NOT NULL,   -- misal: 'preventive', 'corrective', 'predictive'
    cost             NUMERIC(15, 2),
    progress_status  TEXT NOT NULL DEFAULT 'pending'
                         CHECK (progress_status IN ('pending', 'in_progress', 'done')),
    notes            TEXT,
    created_by       UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Tabel: `notifications`

```sql
-- Notifikasi untuk pengguna (diisi oleh trigger database atau Edge Function)
CREATE TABLE public.notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()

    -- TODO: Tambahkan kolom 'type' (misal: 'maintenance_due', 'movement')
    -- TODO: Tambahkan kolom 'link' untuk navigasi langsung dari notifikasi
);
```

---

### View: `assets_status_count`

```sql
-- View agregasi: menghitung jumlah aset per status
-- Digunakan oleh Pie Chart pada halaman Dashboard Admin
CREATE VIEW public.assets_status_count AS
SELECT
    status_asset AS status,
    COUNT(*)     AS count
FROM
    public.assets
GROUP BY
    status_asset;
```

---

## 🔐 Row Level Security (RLS)

Sangat direkomendasikan untuk mengaktifkan **Row Level Security (RLS)** pada semua tabel di Supabase.

```sql
-- Aktifkan RLS pada tabel assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Semua pengguna yang login dapat membaca data aset
CREATE POLICY "Authenticated users can read assets"
ON public.assets FOR SELECT
USING (auth.role() = 'authenticated');

-- Kebijakan: Hanya admin yang boleh menambah, mengubah, dan menghapus aset
CREATE POLICY "Only admins can insert assets"
ON public.assets FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only admins can update assets"
ON public.assets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only admins can delete assets"
ON public.assets FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- TODO: Definisikan seluruh kebijakan RLS untuk setiap tabel dan operasi
```

---

*Dokumentasi ini dibuat berdasarkan analisis kode sumber proyek MaintTrack. Perbarui dokumentasi ini setiap kali ada perubahan signifikan pada arsitektur atau fitur sistem.*
