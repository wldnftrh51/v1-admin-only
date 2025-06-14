import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';

// Konfigurasi S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // },
});

const bucketName = process.env.AWS_BUCKET_NAME;

// GET: ambil semua guru
export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM guru ORDER BY id_guru DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: tambah guru dengan upload foto
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
      const uniqueFileName = `guru/foto/${uuidv4()}.${fileExtension}`;

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
      const { nama, jabatan, nip, tempat, tanggal_lahir, jenis_kelamin, foto } = await request.json();

      if (!nama || !jabatan || !nip || !tempat || !tanggal_lahir || !jenis_kelamin) {
        return new NextResponse('Missing required fields', { status: 400 });
      }

      const [result] = await db.execute(
        'INSERT INTO guru (nama, jabatan, nip, tempat, tanggal_lahir, jenis_kelamin, foto, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [nama, jabatan, nip, tempat, tanggal_lahir, jenis_kelamin, foto]
      );

      const newGuru = {
        id: result.insertId,
        nama,
        jabatan,
        nip,
        tempat,
        tanggal_lahir,
        jenis_kelamin,
        foto
      };

      return NextResponse.json(newGuru, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/guru error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("ID guru tidak ditemukan", { status: 400 });
  }

  try {
    // Get guru data first to get foto URL for deletion
    const [guruRows] = await db.execute("SELECT foto FROM guru WHERE id_guru = ?", [id]);
    
    if (guruRows.length === 0) {
      return new NextResponse("Guru tidak ditemukan", { status: 404 });
    }

    const guru = guruRows[0];

    // Delete from database
    const [result] = await db.execute("DELETE FROM guru WHERE id_guru = ?", [id]);
    
    if (result.affectedRows === 0) {
      return new NextResponse("Guru tidak ditemukan atau sudah dihapus", { status: 404 });
    }

    // Delete foto from S3 if exists
    if (guru.foto && guru.foto.includes(bucketName)) {
      try {
        // Extract S3 key from URL
        const s3Key = guru.foto.split(`${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
        
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

    return new NextResponse("Guru berhasil dihapus", { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus guru:", error);
    return new NextResponse("Gagal menghapus guru", { status: 500 });
  }
}

// PUT: update guru
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("ID guru tidak ditemukan", { status: 400 });
    }

    const contentType = request.headers.get('content-type');
    
    // Handle file upload (FormData) - untuk update foto
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file || !(file instanceof File)) {
        return new NextResponse('No file provided', { status: 400 });
      }

      // Get current guru data to delete old photo
      const [guruRows] = await db.execute("SELECT foto FROM guru WHERE id_guru = ?", [id]);
      
      if (guruRows.length === 0) {
        return new NextResponse("Guru tidak ditemukan", { status: 404 });
      }

      const currentGuru = guruRows[0];

      // Generate unique filename for new photo
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `guru/foto/${uuidv4()}.${fileExtension}`;

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
      if (currentGuru.foto && currentGuru.foto.includes(bucketName)) {
        try {
          const s3Key = currentGuru.foto.split(`${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
          
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
        nama,
        jabatan,
        nip,
        tempat,
        tanggal_lahir,
        jenis_kelamin,
        foto
      } = await request.json();

      // Check if guru exists
      const [existingRows] = await db.execute("SELECT * FROM guru WHERE id_guru = ?", [id]);
      
      if (existingRows.length === 0) {
        return new NextResponse("Guru tidak ditemukan", { status: 404 });
      }

      // Update guru data
      const [result] = await db.execute(
        `UPDATE guru SET 
        nama = COALESCE(?, nama),
        jabatan = COALESCE(?, jabatan),
        nip = COALESCE(?, nip),
        tempat = COALESCE(?, tempat),
        tanggal_lahir = COALESCE(?, tanggal_lahir),
        jenis_kelamin = COALESCE(?, jenis_kelamin),
        foto = COALESCE(?, foto),
        created_at = NOW()
        WHERE id_guru = ?`,
        [
          nama,
          jabatan,
          nip,
          tempat,
          tanggal_lahir,
          jenis_kelamin,
          foto,
          id
        ]
      );

      if (result.affectedRows === 0) {
        return new NextResponse("Gagal mengupdate data guru", { status: 500 });
      }

      // Get updated guru data
      const [updatedRows] = await db.execute("SELECT * FROM guru WHERE id_guru = ?", [id]);
      
      return NextResponse.json(updatedRows[0], { status: 200 });
    }
  } catch (error) {
    console.error('PUT /api/guru error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}