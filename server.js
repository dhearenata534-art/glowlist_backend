const express = require('express');
const cors = require('cors');
const app = express();
const mysql2 = require('mysql2');
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'glowlist_db'
});

db.connect(err => {
    if (err) {
        console.error('Gagal konek ke database:', err);
    } else {
        console.log('Berhasil konek ke database GlowList');
    }
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Selamat Datangg di GlowList APIIIII-!!!!');
});

// ============== GET produk =============== //
app.get('/produk', (req, res) => {
    const sql = 'SELECT * FROM produk';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});
// ======================================== //

// ============== POST produk =============== //
app.post('/produk', (req, res) => {
    const { judul, deskripsi, harga, id_kategori } = req.body;

    if (!judul || !harga) {
        return res.status(400).json({ message: 'Judul dan Harga Wajib  diisi ya!'});
    }

    if (!deskripsi) {
        return res.status(400).json({ message: 'deskripsi juga Wajib  diisi ya!'});
    }

    const sql = 'INSERT INTO produk (judul, deskripsi, harga, id_kategori, tgl_input) VALUES (?, ?, ?, ?, NOW())';
    db.query(sql, [judul, deskripsi, harga, id_kategori], (err, result)  => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.json({
            message: 'Produk Berhasil Ditambahkan, Alhamdulilah..',
            id_produk: result.insertId
        });
    });
});
// ======================================== //

// ============== PUT produk =============== //
app.put('/produk/:id_produk', (req, res) => {
    const { id_produk } = req.params;
    const { judul, deskripsi, harga, id_kategori } = req.body;

    if (!judul || !harga) {
        return res.status(400).json({message: 'Judul dan harga wajib diisi' });
    }

    const sql = 'UPDATE produk SET judul=?, deskripsi=?, harga=?, id_kategori=? WHERE id_produk=?';
    db.query(sql, [judul, deskripsi, harga, id_kategori, id_produk], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }
        res.json({ message: 'Produk berhasil di Update!!' });
    });
});
// ======================================== //

// ============== DELETE produk =============== //
app.delete('/produk/:id_produk', (req, res) => {
    const { id_produk } = req.params;
    const sql = 'DELETE FROM produk WHERE id_produk = ?';
    db.query(sql, [id_produk], (err, result) => {
        if (err) return res.status(500).json({ error: sqlMessage });
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }
        res.json({ message: 'Produk berhasil dihapus!'});
    });
});
// ======================================== //

// ============== GET kategori =============== //
app.get('/kategori', (req, res) => {
    const sql = 'SELECT * FROM kategori';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});
// ======================================== //

app.listen(PORT, () => {
    console.log(`Server GlowList jalan di http://localhost:${PORT}`);
});