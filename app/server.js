import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.json());

// POST /api/signup - 사용자 저장
app.post('/api/signup', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  }

  let users = [];
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    users = JSON.parse(data);
  } catch (err) {
    // 파일이 없으면 처음 작성  
    users = [];
  }

  users.push({ username, password, email });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  res.status(201).json({ message: '회원가입 성공!' });
});

// POST /api/login - 로그인 확인
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      res.status(200).json({ message: '로그인 성공' });
    } else {
      res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// GET /api/users - 사용자 목록 (비밀번호 제외)
app.get('/api/users', async (req, res) => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    const result = users.map(({ username, email }) => ({ username, email }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '사용자 정보를 불러올 수 없습니다.' });
  }
});

// GET /api/os - OS 정보 반환
app.get('/api/os', (req, res) => {
  const osInfo = {
    type: os.type(),
    hostname: os.hostname(),
    cpu_num: os.cpus().length,
    total_mem: `${Math.round(os.totalmem() / 1024 / 1024)} MB`
  };
  res.json(osInfo);
});

// GET /api/health - 헬스 체크
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
