const BASE = process.env.BASE_URL || 'http://localhost:3000/api/v1';
const TIMEOUT = parseInt(process.env.TIMEOUT, 10) || 10000;

const results = [];
let token = null;

function ok(msg) {
  console.log('\x1b[32m%s\x1b[0m', 'PASS - ' + msg);
}

function fail(msg) {
  console.log('\x1b[31m%s\x1b[0m', 'FAIL - ' + msg);
}

async function request(method, path, body = null, useAuth = true) {
  const url = BASE + path;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  const headers = { 'Content-Type': 'application/json' };
  if (useAuth && token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(id);
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    return { status: res.status, ok: res.ok, body: json };
  } catch (err) {
    clearTimeout(id);
    return { error: err.message || String(err) };
  }
}

function randomStr(len = 8) {
  return Math.random().toString(36).substring(2, 2 + len);
}

async function run() {
  console.log('Base URL:', BASE);
  // Credenciales fijas para pruebas
  const email = 'danieltopo1998@gmail.com';
  const pwd = 'Password123!';

  // 1) Register (skip if using fixed credentials - user likely exists)
  console.log('\n1) Register / Check user');
  const registerBody = {
    name: 'Admin',
    lastname: 'User',
    email,
    password: pwd,
  };
  let res = await request('POST', '/auth/register', registerBody, false);
  if (res.error) {
    console.log('   Registro no disponible, continuando con login...');
  } else if (res.status === 201 || res.status === 200) {
    ok(`Usuario registrado ${email} (${res.status})`);
    results.push(true);
  } else if (res.status === 409) {
    ok('Usuario ya existe, continuando con login');
    results.push(true);
  } else {
    console.log(`   Registro falló (${res.status}), continuando con login...`);
    results.push(true);
  }

  // 2) Login
  console.log('\n2) Login');
  res = await request('POST', '/auth/login', { email, password: pwd }, false);
  if (res.error) {
    fail(`Login network error: ${res.error}`);
    results.push(false);
    return finish();
  }
  if (res.status !== 200) {
    fail(`Login failed (${res.status}): ${JSON.stringify(res.body)}`);
    results.push(false);
    return finish();
  }
  // Expect accessToken
  token = res.body && res.body.accessToken ? res.body.accessToken : null;
  if (!token) {
    fail('Login response missing accessToken');
    results.push(false);
    return finish();
  }
  ok('Login successful and token acquired');
  results.push(true);

  // 3) Profile
  console.log('\n3) Get profile');
  res = await request('GET', '/auth/profile', null, true);
  if (res.error) {
    fail(`Profile error: ${res.error}`);
    results.push(false);
  } else if (res.status === 200) {
    ok(`Profile fetched: ${res.body.email || 'unknown email'}`);
    results.push(true);
  } else {
    fail(`Profile failed (${res.status}): ${JSON.stringify(res.body)}`);
    results.push(false);
  }

  // 4) Create Camera
  console.log('\n4) Create camera');
  const cameraBody = {
    name: `Cámara ${randomStr(5)}`,
    location: `Ubicación ${randomStr(4)}`,
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    streamUrl: `http://example.com/stream/${randomStr(8)}`,
  };
  res = await request('POST', '/cameras', cameraBody, true);
  let cameraId = null;
  if (res.error) {
    fail(`Create camera error: ${res.error}`);
    results.push(false);
  } else if (res.status === 201) {
    cameraId = res.body && res.body.id;
    ok(`Camera created: ${cameraId}`);
    results.push(true);
  } else {
    fail(`Create camera failed (${res.status}): ${JSON.stringify(res.body)}`);
    results.push(false);
  }

  // 5) Verify camera exists via GET /cameras and GET /cameras/:id
  console.log('\n5) Verify camera via GET');
  res = await request('GET', '/cameras', null, false);
  if (res.error) {
    fail(`GET /cameras error: ${res.error}`);
    results.push(false);
  } else if (res.status === 200) {
    const list = Array.isArray(res.body) ? res.body : [];
    const found = cameraId && list.find((c) => c.id === cameraId);
    if (found) {
      ok('Camera present in list');
      results.push(true);
    } else if (cameraId) {
      fail('Camera not found in list');
      results.push(false);
    } else {
      console.log('No camera id to verify, skipping');
      results.push(false);
    }
  } else {
    fail(`GET /cameras failed (${res.status})`);
    results.push(false);
  }

  if (cameraId) {
    res = await request('GET', `/cameras/${cameraId}`, null, false);
    if (res.error) {
      fail(`GET /cameras/${cameraId} error: ${res.error}`);
      results.push(false);
    } else if (res.status === 200) {
      ok(`GET /cameras/${cameraId} returned OK`);
      results.push(true);
    } else {
      fail(`GET /cameras/${cameraId} failed (${res.status})`);
      results.push(false);
    }
  }

  // 6) Create Event
  console.log('\n6) Create event');
  let eventId = null;
  if (cameraId) {
    const eventBody = {
      cameraId,
      type: `evento_${randomStr(4)}`,
      description: `Evento de prueba ${randomStr(6)}`,
      location: `Ubicación ${randomStr(5)}`,
      confidence: Math.random() * 0.5 + 0.5, // 0.5 a 1.0
    };
    res = await request('POST', '/events', eventBody, true);
    if (res.error) {
      fail(`Create event error: ${res.error}`);
      results.push(false);
    } else if (res.status === 201) {
      eventId = res.body && res.body.id;
      ok(`Event created: ${eventId}`);
      results.push(true);
    } else {
      fail(`Create event failed (${res.status}): ${JSON.stringify(res.body)}`);
      results.push(false);
    }
  } else {
    console.log('No cameraId available, skipping event creation');
    results.push(false);
  }

  // 7) Verify event via GET /events
  console.log('\n7) Verify event list');
  res = await request('GET', '/events', null, false);
  if (res.error) {
    fail(`GET /events error: ${res.error}`);
    results.push(false);
  } else if (res.status === 200) {
    const list = Array.isArray(res.body) ? res.body : [];
    const found = eventId && list.find((e) => e.id === eventId);
    if (found) {
      ok('Event present in list');
      results.push(true);
    } else if (eventId) {
      fail('Event not found in list');
      results.push(false);
    } else {
      console.log('No event id to verify, skipping');
      results.push(false);
    }
  } else {
    fail(`GET /events failed (${res.status})`);
    results.push(false);
  }

  // 8) Create Alert
  console.log('\n8) Create alert');
  let alertId = null;
  if (eventId) {
    const priorities = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
    const alertBody = {
      eventId,
      message: `Alerta ${randomStr(6)} - prueba automatizada`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
    };
    res = await request('POST', '/alerts', alertBody, true);
    if (res.error) {
      fail(`Create alert error: ${res.error}`);
      results.push(false);
    } else if (res.status === 201) {
      alertId = res.body && res.body.id;
      ok(`Alert created: ${alertId}`);
      results.push(true);
    } else {
      fail(`Create alert failed (${res.status}): ${JSON.stringify(res.body)}`);
      results.push(false);
    }
  } else {
    console.log('No eventId available, skipping alert creation');
    results.push(false);
  }

  // 9) Verify alerts
  console.log('\n9) Verify alerts list');
  res = await request('GET', '/alerts', null, true);
  if (res.error) {
    fail(`GET /alerts error: ${res.error}`);
    results.push(false);
  } else if (res.status === 200) {
    const list = Array.isArray(res.body) ? res.body : [];
    const found = alertId && list.find((a) => a.id === alertId);
    if (found) {
      ok('Alert present in list');
      results.push(true);
    } else if (alertId) {
      fail('Alert not found in list');
      results.push(false);
    } else {
      console.log('No alert id to verify, skipping');
      results.push(false);
    }
  } else {
    fail(`GET /alerts failed (${res.status})`);
    results.push(false);
  }

  // 10) Cleanup: delete alert, event, camera
  console.log('\n10) Cleanup created resources');
  if (alertId) {
    res = await request('DELETE', `/alerts/${alertId}`, null, true);
    if (res.error) {
      fail(`DELETE /alerts/${alertId} error: ${res.error}`);
      results.push(false);
    } else if (res.status === 204) {
      ok(`Alert ${alertId} deleted`);
      results.push(true);
    } else {
      fail(`DELETE alert failed (${res.status})`);
      results.push(false);
    }
  }

  if (eventId) {
    res = await request('DELETE', `/events/${eventId}`, null, true);
    if (res.error) {
      fail(`DELETE /events/${eventId} error: ${res.error}`);
      results.push(false);
    } else if (res.status === 204) {
      ok(`Event ${eventId} deleted`);
      results.push(true);
    } else {
      fail(`DELETE event failed (${res.status})`);
      results.push(false);
    }
  }

  if (cameraId) {
    res = await request('DELETE', `/cameras/${cameraId}`, null, true);
    if (res.error) {
      fail(`DELETE /cameras/${cameraId} error: ${res.error}`);
      results.push(false);
    } else if (res.status === 204) {
      ok(`Camera ${cameraId} deleted`);
      results.push(true);
    } else {
      fail(`DELETE camera failed (${res.status})`);
      results.push(false);
    }
  }

  return finish();
}

function finish() {
  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;
  console.log('\n=== SUMMARY ===');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(2);
});
