const express = require('express');
const cors = require('cors');
const app = express();
const mysql2 = require('mysql2');
const PORT = 3001;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authJWT = require('./middleware');
const saltRounds = 10;

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

app.get('/produk/:id_produk', (req, res) => {
    const { id_produk } = req.params;
    const sql = 'SELECT * FROM produk WHERE id_produk =?';
    db.query(sql, [id_produk], (err, results) => {
        if (err) { 
            return res.status(500).json({ error: err });
        }
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
app.put('/produk/:id_produk', authJWT, (req, res) => {
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
app.delete('/produk/:id_produk', authJWT, (req, res) => {
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

// ============== POST pengguna =============== //
app.post ('/pengguna', async (req, res) => {
    const { nama, email, password, no_hp } = req.body;

    if (!nama || !email || !password) {
        return res.status(400).json({message: "nama, Email, dan Password wajib diisi duluu"});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = 'INSERT INTO pengguna (nama, email, password, no_hp) VALUES (?, ?, ?, ?)';
        db.query(sql, [nama, email, hashedPassword, no_hp], (err, result) => {
             if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        message: 'Email sudah terdaftar, gunakan email lain'
                    });
                }
                return res.status(500).json({
                    error: err.sqlMessage
                });
            }

            res.json({
                message: 'Akun berhasil dibuat!',
                id_pengguna: result.insertId
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengenkripsi password' });
    }
});
// ======================================== //

// ============== LOGIN pengguna =============== //
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM pengguna WHERE email = ?';

    db.query(sql, [email], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (result.length === 0) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }

        const user = result[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Password salah' });
        }

        const token = jwt.sign(
            { id: user.id_pengguna },
            'glowlistrahasia',
            { expiresIn: 86400 }
        );

        res.status(200).json({
            auth: true,
            token,
            id_pengguna: user.id_pengguna,
            nama: user.nama
        });
    });
});
// ======================================== //



app.listen(PORT, () => {
    console.log(`Server GlowList jalan di http://localhost:${PORT}`);
});