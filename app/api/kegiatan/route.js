import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import db from '../db'; // pastikan path ini benar

// Konfigurasi S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME;

export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM kegiatan ORDER BY id_kegiatan DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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
      const uniqueFileName = `kegiatan/foto/${uuidv4()}.${fileExtension}`;

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
      const { judul, tanggal, deskripsi, foto } = await request.json();

      if (!judul || !tanggal || !deskripsi) {
        return new NextResponse(JSON.stringify({ error: 'Semua field harus diisi' }), { status: 400 });
      }

      const [result] = await db.execute(
        'INSERT INTO kegiatan (judul, tanggal, deskripsi, foto, created_at) VALUES (?, ?, ?, ?, NOW())',
        [judul, tanggal, deskripsi, foto || null]
      );

      const newKegiatan = {
        id_kegiatan: result.insertId,
        judul,
        tanggal,
        deskripsi,
        foto
      };

      return NextResponse.json(newKegiatan, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/kegiatan error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("ID kegiatan tidak ditemukan", { status: 400 });
  }

  try {
    // Get kegiatan data first to get foto URL for deletion
    const [kegiatanRows] = await db.execute("SELECT foto FROM kegiatan WHERE id_kegiatan = ?", [id]);
    
    if (kegiatanRows.length === 0) {
      return new NextResponse("Kegiatan tidak ditemukan", { status: 404 });
    }

    const kegiatan = kegiatanRows[0];

    // Delete from database
    const [result] = await db.execute("DELETE FROM kegiatan WHERE id_kegiatan = ?", [id]);
    
    if (result.affectedRows === 0) {
      return new NextResponse("Kegiatan tidak ditemukan atau sudah dihapus", { status: 404 });
    }

    // Delete foto from S3 if exists
    if (kegiatan.foto && kegiatan.foto.includes(bucketName)) {
      try {
        // Extract S3 key from URL
        const s3Key = kegiatan.foto.split(`${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
        
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

    return new NextResponse("Kegiatan berhasil dihapus", { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus kegiatan:", error);
    return new NextResponse("Gagal menghapus kegiatan", { status: 500 });
  }
}

// PUT untuk update data kegiatan
export async function PUT(request) {
  try {
    const { id_kegiatan, judul, tanggal, deskripsi, foto } = await request.json();

    if (!id_kegiatan || !judul || !tanggal || !deskripsi) {
      return new NextResponse(JSON.stringify({ error: 'Semua field harus diisi' }), { status: 400 });
    }

    const [result] = await db.execute(
      'UPDATE kegiatan SET judul = ?, tanggal = ?, deskripsi = ?, foto = ?, updated_at = NOW() WHERE id_kegiatan = ?',
      [judul, tanggal, deskripsi, foto || null, id_kegiatan]
    );

    if (result.affectedRows === 0) {
      return new NextResponse('Kegiatan tidak ditemukan', { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Kegiatan berhasil diupdate',
      data: { id_kegiatan, judul, tanggal, deskripsi, foto }
    });
  } catch (error) {
    console.error('Gagal update kegiatan:', error);
    return new NextResponse('Gagal update kegiatan', { status: 500 });
  }
}