// server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- إعداد Express ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- إعداد قاعدة البيانات ---
// ⚠️ استبدل هذا بـ Connection String الخاص بك من MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://abrahim71192:775796741As.@cluster0.4xxntd8.mongodb.net/?appName=Cluster0';

// --- تعريف Schema و Model ---
const medicalRecordSchema = new mongoose.Schema({
  servicecode: { type: String, required: true },
  idNumber: { type: String, required: true },
  name: { type: String, required: true },
  issueDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  doctor: { type: String, required: true },
  jobTitle: { type: String, required: true }
}, {
  timestamps: true
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'public')));

// --- المسارات (Routes) ---
app.post('/api/medical', async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();
    res.status(201).json({ message: 'تم حفظ البيانات بنجاح!', id: record._id });
  } catch (error) {
    console.error('خطأ في الحفظ:', error);
    res.status(400).json({ error: error.message || 'فشل حفظ البيانات' });
  }
});

// --- مسار للبحث عن سجل باستخدام idNumber و servicecode ---
app.get('/api/medical/search', async (req, res) => {
  const { idNumber, servicecode } = req.query;

  // التحقق من وجود المعلَمين
  if (!idNumber || !servicecode) {
    return res.status(400).json({ error: 'يجب تمرير "idNumber" و "servicecode" كـ query parameters' });
  }

  try {
    const record = await MedicalRecord.findOne({ idNumber, servicecode });

    if (!record) {
      return res.status(404).json({ error: 'خطأ في الاستعلام' });
    }

    res.json(record);
  } catch (error) {
    console.error('خطأ في البحث:', error);
    res.status(500).json({ error: 'فشل في جلب البيانات' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- الاتصال بـ MongoDB وتشغيل الخادم ---
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ تم الاتصال بقاعدة بيانات MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ فشل الاتصال بـ MongoDB:', err);
    process.exit(1);
  });
