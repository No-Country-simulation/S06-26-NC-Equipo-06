import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ─── Métricas por endpoint ─────────────────────────────────────────────────
const loginSuccess = new Counter('login_success');
const loginFailed = new Counter('login_failed');
const loginErrorRate = new Rate('login_error_rate');
const loginDuration = new Trend('login_duration', true);

const verifySuccess = new Counter('verify_success');
const verifyFailed = new Counter('verify_failed');
const verifyErrorRate = new Rate('verify_error_rate');
const verifyDuration = new Trend('verify_duration', true);

// ─── Configuración ─────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '60s', target: 10 },
    { duration: '30s', target: 30 },
    { duration: '60s', target: 30 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],

    login_duration: ['p(95)<500'],
    login_error_rate: ['rate<0.01'],

    verify_duration: ['p(95)<200'], // verify-auth solo valida token → debe ser más rápido
    verify_error_rate: ['rate<0.01'],
  },
};

// ─── Datos de prueba ────────────────────────────────────────────────────────
const USERS = [
  { email: 'traviesogonzalo1@gmail.com', password: '123456789' },
  { email: 'zhark.enquiries@gmail.com', password: '123456789' },
  { email: 'freeecode0@gmail.com', password: '123456789' },
];

const PORT = __ENV.PORT || '8080';
const BASE_URL = `http://localhost:${PORT}/api/v1/auth-users`;

// ─── Escenario principal ────────────────────────────────────────────────────
export default function () {
  const user = USERS[Math.floor(Math.random() * USERS.length)];

  // Cookie jar por VU — cada usuario virtual tiene sus propias cookies
  // k6 las envía automáticamente en los requests siguientes
  const jar = http.cookieJar();

  // ── 1. Login ──────────────────────────────────────────────────────────────
  group('Login', () => {
    const res = http.post(
      `${BASE_URL}/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'login' },
        jar,     // el servidor setea las cookies aquí
      }
    );

    loginDuration.add(res.timings.duration);

    const ok = check(res, {
      'login: status 200': (r) => r.status === 200,
      'login: tiempo < 500ms': (r) => r.timings.duration < 500,
      'login: body no vacío': (r) => r.body && r.body.length > 0,
    });

    if (ok && res.status === 200) {
      loginSuccess.add(1);
      loginErrorRate.add(false);
    } else {
      loginFailed.add(1);
      loginErrorRate.add(true);
      console.error(`[login] status=${res.status} duration=${res.timings.duration}ms`);
    }
  });

  sleep(0.5); // pausa breve — simula tiempo de carga del frontend tras el login

  // ── 2. Verify Auth ────────────────────────────────────────────────────────
  group('Verify Auth', () => {
    const res = http.get(
      `${BASE_URL}/verify-auth`,
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'verify-auth' },
        jar,     // envía automáticamente las cookies del login
      }
    );

    verifyDuration.add(res.timings.duration);

    const ok = check(res, {
      'verify-auth: status 200': (r) => r.status === 200,
      'verify-auth: tiempo < 200ms': (r) => r.timings.duration < 200,
      'verify-auth: body no vacío': (r) => r.body && r.body.length > 0,
    });

    if (ok && res.status === 200) {
      verifySuccess.add(1);
      verifyErrorRate.add(false);
    } else {
      verifyFailed.add(1);
      verifyErrorRate.add(true);
      console.error(`[verify-auth] status=${res.status} duration=${res.timings.duration}ms`);
    }
  });

  sleep(randomBetween(1, 3));
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}