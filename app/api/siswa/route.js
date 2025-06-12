import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';

// Konfigurasi S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME;

// GET: ambil semua siswa
export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM siswa ORDER BY id_siswa DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: tambah siswa dengan upload foto
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle file upload (FormData)
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file || !(file instanceof File)) {
        return new NextResponse('No file provided', { status: 400 });
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `siswa/foto/${uuidv4()}.${fileExtension}`;

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to S3
      const uploadParams = {
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: buffer,
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      // Return S3 URL
      const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
      
      return NextResponse.json({ url: s3Url });
    }
    
    // Handle data insertion (JSON)
    else {
      const {
        nama_lengkap,
        nisn,
        alamat,
        kelas,
        jenis_kelamin,
        nama_panggilan,
        tempat_lahir,
        tanggal_lahir,
        anak_ke,
        jumlah_saudara,
        agama,
        status_dalam_keluarga,
        kewarganegaraan,
        file_path
      } = await request.json();

      if (!nama_lengkap || !nisn) {
        return new NextResponse('Missing required fields', { status: 400 });
      }

      const [result] = await db.execute(
        `INSERT INTO siswa 
        (nama_lengkap, nisn, alamat, kelas, jenis_kelamin, nama_panggilan, tempat_lahir, tanggal_lahir, anak_ke, jumlah_saudara, agama, status_dalam_keluarga, kewarganegaraan, file_path, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          nama_lengkap,
          nisn,
          alamat,
          kelas,
          jenis_kelamin,
          nama_panggilan,
          tempat_lahir,
          tanggal_lahir,
          anak_ke,
          jumlah_saudara,
          agama,
          status_dalam_keluarga,
          kewarganegaraan,
          file_path
        ]
      );

      const newSiswa = {
        id_siswa: result.insertId,
        nama_lengkap,
        nisn,
        alamat,
        kelas,
        jenis_kelamin,
        nama_panggilan,
        tempat_lahir,
        tanggal_lahir,
        anak_ke,
        jumlah_saudara,
        agama,
        status_dalam_keluarga,
        kewarganegaraan,
        file_path
      };

      return NextResponse.json(newSiswa, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/siswa error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT: update siswa
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("ID siswa tidak ditemukan", { status: 400 });
    }

    const contentType = request.headers.get('content-type');
    
    // Handle file upload (FormData) - untuk update foto
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file || !(file instanceof File)) {
        return new NextResponse('No file provided', { status: 400 });
      }

      // Get current siswa data to delete old photo
      const [siswaRows] = await db.execute("SELECT file_path FROM siswa WHERE id_siswa = ?", [id]);
      
      if (siswaRows.length === 0) {
        return new NextResponse("Siswa tidak ditemukan", { status: 404 });
      }

      const currentSiswa = siswaRows[0];

      // Generate unique filename for new photo
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `siswa/foto/${uuidv4()}.${fileExtension}`;

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload new photo to S3
      const uploadParams = {
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: buffer,
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      // Delete old photo from S3 if exists
      if (currentSiswa.file_path && currentSiswa.file_path.includes(bucketName)) {
        try {
          const s3Key = currentSiswa.file_path.split(`${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
          
          if (s3Key) {
            const deleteParams = {
              Bucket: bucketName,
              Key: s3Key,
            };

            await s3.send(new DeleteObjectCommand(deleteParams));
          }
        } catch (s3Error) {
          console.error('Error deleting old S3 file:', s3Error);
        }
      }

      // Return new S3 URL
      const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
      
      return NextResponse.json({ url: s3Url });
    }
    
    // Handle data update (JSON)
    else {
      const {
        nama_lengkap,
        nisn,
        alamat,
        kelas,
        jenis_kelamin,
        nama_panggilan,
        tempat_lahir,
        tanggal_lahir,
        anak_ke,
        jumlah_saudara,
        agama,
        status_dalam_keluarga,
        kewarganegaraan,
        file_path
      } = await request.json();

      // Check if siswa exists
      const [existingRows] = await db.execute("SELECT * FROM siswa WHERE id_siswa = ?", [id]);
      
      if (existingRows.length === 0) {
        return new NextResponse("Siswa tidak ditemukan", { status: 404 });
      }

      // Update siswa data
      const [result] = await db.execute(
        `UPDATE siswa SET 
        nama_lengkap = COALESCE(?, nama_lengkap),
        nisn = COALESCE(?, nisn),
        alamat = COALESCE(?, alamat),
        kelas = COALESCE(?, kelas),
        jenis_kelamin = COALESCE(?, jenis_kelamin),
        nama_panggilan = COALESCE(?, nama_panggilan),
        tempat_lahir = COALESCE(?, tempat_lahir),
        tanggal_lahir = COALESCE(?, tanggal_lahir),
        anak_ke = COALESCE(?, anak_ke),
        jumlah_saudara = COALESCE(?, jumlah_saudara),
        agama = COALESCE(?, agama),
        status_dalam_keluarga = COALESCE(?, status_dalam_keluarga),
        kewarganegaraan = COALESCE(?, kewarganegaraan),
        file_path = COALESCE(?, file_path),
        created_at = NOW()
        WHERE id_siswa = ?`,
        [
          nama_lengkap,
          nisn,
          alamat,
          kelas,
          jenis_kelamin,
          nama_panggilan,
          tempat_lahir,
          tanggal_lahir,
          anak_ke,
          jumlah_saudara,
          agama,
          status_dalam_keluarga,
          kewarganegaraan,
          file_path,
          id
        ]
      );

      if (result.affectedRows === 0) {
        return new NextResponse("Gagal mengupdate data siswa", { status: 500 });
      }

      // Get updated siswa data
      const [updatedRows] = await db.execute("SELECT * FROM siswa WHERE id_siswa = ?", [id]);
      
      return NextResponse.json(updatedRows[0], { status: 200 });
    }
  } catch (error) {
    console.error('PUT /api/siswa error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE: hapus siswa beserta fotonya di S3
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("ID siswa tidak ditemukan", { status: 400 });
  }

  try {
    // Get siswa data first to get foto URL for deletion
    const [siswaRows] = await db.execute("SELECT file_path FROM siswa WHERE id_siswa = ?", [id]);
    
    if (siswaRows.length === 0) {
      return new NextResponse("Siswa tidak ditemukan", { status: 404 });
    }

    const siswa = siswaRows[0];

    // Delete from database
    const [result] = await db.execute("DELETE FROM siswa WHERE id_siswa = ?", [id]);
    
    if (result.affectedRows === 0) {
      return new NextResponse("Siswa tidak ditemukan atau sudah dihapus", { status: 404 });
    }

    // Delete foto from S3 if exists
    if (siswa.file_path && siswa.file_path.includes(bucketName)) {
      try {
        // Extract S3 key from URL
        const s3Key = siswa.file_path.split(`${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
        
        if (s3Key) {
          const deleteParams = {
            Bucket: bucketName,
            Key: s3Key,
          };

          await s3.send(new DeleteObjectCommand(deleteParams));
        }
      } catch (s3Error) {
        console.error('Error deleting S3 file:', s3Error);
        // Continue even if S3 deletion fails
      }
    }

    return new NextResponse("Siswa berhasil dihapus", { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus siswa:", error);
    return new NextResponse("Gagal menghapus siswa", { status: 500 });
  }
}