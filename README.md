# ⚡ Azure Functions V4 - Event Handler

Duas Azure Functions com HTTP Triggers (Model V4) para integração com BFF Service.

Desenvolvido por: **[@iYoNuttxD](https://github.com/iYoNuttxD)**

---

## 🎯 Functions

### 1. CreateEvent
- **Método:** POST
- **Endpoint:** `/api/CreateEvent`
- **Função:** Recebe evento do BFF e persiste no MongoDB Atlas

**Body esperado:**
```json
{
  "type": "PEDIDO_CRIADO",
  "data": {
    "pedidoId": "123",
    "clienteId": "456",
    "valor": 100.00
  }
}
```

### 2. GetData
- **Método:** GET
- **Endpoints:** 
  - `/api/GetData` - Lista todos os eventos
  - `/api/GetData/{id}` - Busca evento específico
- **Query Params:**
  - `limit` - Limite de registros (default: 50)
  - `skip` - Paginação (default: 0)
  - `type` - Filtrar por tipo de evento

---

## 🛠️ Tecnologias

- Node.js 18+
- Azure Functions Runtime v4 (Programming Model V4)
- MongoDB Atlas
- HTTP Triggers

---

## 🚀 Executar Localmente

### 1. Pré-requisitos

```bash
# Instalar Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis

Crie o arquivo `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "sua-connection-string-aqui",
    "MONGODB_DATABASE": "OrdersServiceDB"
  }
}
```

### 4. Executar

```bash
npm start
```

Functions disponíveis em:
- POST http://localhost:7071/api/CreateEvent
- GET http://localhost:7071/api/GetData

---

## 🧪 Testar Localmente

### Criar Evento

**Linux/Mac:**
```bash
curl -X POST http://localhost:7071/api/CreateEvent \
  -H "Content-Type: application/json" \
  -d '{"type":"PEDIDO_CRIADO","data":{"pedidoId":"123","clienteId":"456","valor":100.00}}'
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:7071/api/CreateEvent" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"type":"PEDIDO_CRIADO","data":{"pedidoId":"123","clienteId":"456","valor":100.00}}'
```

### Buscar Eventos

```bash
# Listar todos
curl http://localhost:7071/api/GetData

# Buscar por ID
curl http://localhost:7071/api/GetData/507f1f77bcf86cd799439011

# Com filtros
curl "http://localhost:7071/api/GetData?type=PEDIDO_CRIADO&limit=10"
```

---

## 📊 Estrutura do Projeto

```
azure-functions-v4/
├── src/
│   └── functions/
│       ├── createEvent.js
│       └── getData.js
├── local.settings.json
├── package.json
├── host.json
└── README.md
```

---

## ☁️ Deploy no Azure

### Via Azure CLI

```bash
# Login
az login

# Criar Resource Group
az group create --name erp-builders-rg --location brazilsouth

# Criar Storage Account
az storage account create \
  --name erpbuilderstorage \
  --resource-group erp-builders-rg \
  --location brazilsouth \
  --sku Standard_LRS

# Criar Function App
az functionapp create \
  --resource-group erp-builders-rg \
  --consumption-plan-location brazilsouth \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name erp-events-functions-v4 \
  --storage-account erpbuilderstorage

# Configurar variáveis de ambiente
az functionapp config appsettings set \
  --name erp-events-functions-v4 \
  --resource-group erp-builders-rg \
  --settings "MONGODB_URI=sua-connection-string" "MONGODB_DATABASE=OrdersServiceDB"

# Deploy
func azure functionapp publish erp-events-functions-v4
```

---

## 🔗 Integração com BFF

Após deploy, atualize o `.env` do BFF:

```env
FUNCTION_CREATE_URL=https://erp-events-functions-v4.azurewebsites.net/api/CreateEvent
FUNCTION_GET_URL=https://erp-events-functions-v4.azurewebsites.net/api/GetData
```

---

## 📄 Licença

MIT

---

## 👤 Autor

**iYoNuttxD**
- GitHub: [@iYoNuttxD](https://github.com/iYoNuttxD)

---

## 📅 Versão

**v1.0.0** - 26/10/2025