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

app.http('GetData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'GetData/{id?}',
  handler: async (request, context) => {
    context.log('📤 GetData - Buscando dados');

    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('eventos');

      const id = request.params.id;

      if (id) {
        if (!ObjectId.isValid(id)) {
          return {
            status: 400,
            jsonBody: {
              success: false,
              error: { message: 'ID inválido' }
            }
          };
        }

        const evento = await collection.findOne({ _id: new ObjectId(id) });

        if (!evento) {
          return {
            status: 404,
            jsonBody: {
              success: false,
              error: { message: 'Evento não encontrado' }
            }
          };
        }

        return {
          status: 200,
          jsonBody: {
            success: true,
            data: evento
          }
        };
      }

      const limit = parseInt(request.query.get('limit')) || 50;
      const skip = parseInt(request.query.get('skip')) || 0;
      const type = request.query.get('type');

      const filter = type ? { type } : {};

      const eventos = await collection
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(filter);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: eventos,
          pagination: {
            total,
            limit,
            skip,
            count: eventos.length
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
            message: 'Erro ao buscar dados',
            details: error.message
          }
        }
      };
    }
  }
});