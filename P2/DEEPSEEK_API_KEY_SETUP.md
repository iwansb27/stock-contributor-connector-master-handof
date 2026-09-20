# DeepSeek API Key — GitHub Secret

Repository secret yang digunakan oleh workflow P2:

- Secret name: DEEPSEEK_API_KEY
- Secret value: API Key DeepSeek milik pemilik repository
- Jangan menaruh key di source code, index.html, app.js, atau file publik.

## Cara memasukkan key

1. Buka repository ini di GitHub.
2. Settings
3. Secrets and variables
4. Actions
5. Secrets
6. New repository secret
7. Name: DEEPSEEK_API_KEY
8. Paste API Key DeepSeek pada Secret
9. Add secret

Setelah tersimpan, nilai key tidak perlu dikirim ke chat.

## Batas keamanan

GitHub Actions dapat membaca repository secret ketika workflow secara eksplisit menggunakan secrets.DEPPSEEK_API_KEY/DEEPSEEK_API_KEY. Nilai secret tidak boleh dicetak ke log.

Catatan: GitHub Pages sendiri adalah hosting statis; repository secret tidak dapat langsung dipakai oleh JavaScript yang berjalan di browser. Secret ini disiapkan untuk sisi server/workflow yang akan kita bangun, bukan untuk ditanam ke frontend.
