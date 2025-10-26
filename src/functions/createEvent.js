const { app } = require('@azure/functions');
const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DATABASE || 'OrdersServiceDB';

  if (!uri) {
    throw new Error('MONGODB_URI não está definida');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

app.http('CreateEvent', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'CreateEvent',
  handler: async (request, context) => {
    context.log('📥 CreateEvent - Recebendo evento');

    try {
      const body = await request.json();

      if (!body || !body.type || !body.data) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            error: {
              message: 'Body inválido. Esperado: { type, data }',
              received: body
            }
          }
        };
      }

      const evento = {
        type: body.type,
        data: body.data,
        timestamp: new Date(),
        source: 'BFF',
        processed: false
      };

      const { db } = await connectToDatabase();
      const collection = db.collection('eventos');
      const result = await collection.insertOne(evento);

      context.log(`✅ Evento salvo com ID: ${result.insertedId}`);

      return {
        status: 201,
        jsonBody: {
          success: true,
          message: 'Evento recebido e persistido com sucesso',
          data: {
            id: result.insertedId,
            type: evento.type,
            timestamp: evento.timestamp
          }
        }
      };

    } catch (error) {
      context.log(`❌ Erro: ${error.message}`);

      return {
        status: 500,
        jsonBody: {
          success: false,
          error: {
            message: 'Erro ao processar evento',
            details: error.message
          }
        }
      };
    }
  }
});