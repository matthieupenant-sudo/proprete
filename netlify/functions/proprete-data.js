const { getStore } = require('@netlify/blobs');

const KEY = 'historique';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

function genId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }

  try {
    const store = getStore('proprete-controles');

    if (event.httpMethod === 'GET') {
      const data = (await store.get(KEY, { type: 'json' })) || [];
      return { statusCode: 200, headers: cors(), body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'POST') {
      const entry = JSON.parse(event.body || '{}');
      entry.id = genId();
      const data = (await store.get(KEY, { type: 'json' })) || [];
      data.push(entry);
      await store.setJSON(KEY, data);
      return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true, id: entry.id }) };
    }

    if (event.httpMethod === 'DELETE') {
      const params = event.queryStringParameters || {};
      let data = (await store.get(KEY, { type: 'json' })) || [];
      if (params.all === '1') {
        data = [];
      } else if (params.id) {
        data = data.filter((e) => e.id !== params.id);
      }
      await store.setJSON(KEY, data);
      return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};
