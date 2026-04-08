# 🚀 Setup Finanças Duo + Firebase

## Passo 1: Criar um Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em **"Criar projeto"**
3. Nome do projeto: `financas-duo`
4. Desabilite Google Analytics (opcional)
5. Clique em **"Criar projeto"**
6. Aguarde a criação (pode levar alguns minutos)

## Passo 2: Configurar Autenticação

1. No Firebase Console, vá para **Authentication** (no menu esquerdo)
2. Clique em **"Get started"**
3. Em **Sign-in method**, habilite **Email/Password**
   - Certifique-se que ambas as opções estão habilitadas
4. Salve

## Passo 3: Criar Banco de Dados Firestore

1. No Firebase Console, vá para **Firestore Database**
2. Clique em **"Create database"**
3. Escolha modo de segurança: **Começar em modo teste**
   - ⚠️ **Importante**: Use apenas para desenvolvimento. Veja seção "Segurança" abaixo para RLS.
4. Escolha a região: `us-central1` (ou a mais próxima)
5. Clique em **"Create"**

## Passo 4: Criar Coleções no Firestore

Após criar o banco de dados:

1. Clique em **"Start collection"**
2. Nome da coleção: `transactions`
3. Para o primeiro documento, escolha **Auto-ID**
4. Adicione um documento de exemplo (pode deixar vazio e adicionar depois):
   ```json
   {
     "userId": "user-id-aqui",
     "title": "Exemplo",
     "description": "Transação de exemplo",
     "date": "2026-04-08",
     "amount": 100,
     "type": "income",
     "category": "Rendimento",
     "subcategory": "Salário",
     "profile": "PF",
     "paymentMethod": "Transferência",
     "hasReceipt": false,
     "isRecurring": false,
     "tags": [],
     "createdAt": "2026-04-08T00:00:00Z",
     "updatedAt": "2026-04-08T00:00:00Z"
   }
   ```
5. Clique em **"Save"**

## Passo 5: Obter Configurações do Projeto

1. No Firebase Console, clique no ícone de **engrenagem** (Project Settings) no canto superior esquerdo
2. Vá para **Project settings** (guia geral)
3. Role para baixo até encontrar **"Your apps"**
4. Clique em **"</>"** (ícone web)
5. Registre seu app como `financas-duo`
6. Copie a configuração (não precisa adicionar SDK manualmente)
7. Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456...",
  appId: "1:123456:web:abc123def456"
};
```

## Passo 6: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os placeholders pelas suas credenciais:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=1:123456:web:abc123def456
```

## Passo 7: Instalar Dependências

```bash
cd ~/Desktop/financas-duo
npm install
```

## Passo 8: Rodar Localmente

```bash
npm run dev
```

Abra: http://localhost:5173

## Passo 9: Configurar Segurança (Firestore Rules)

### ⚠️ IMPORTANTE: Modo Teste vs. Produção

**Modo Teste (desenvolvimento):** Qualquer um pode ler/escrever (NÃO seguro para produção)

**Modo Produção (recomendado):** Apenas proprietário pode ler/escrever

### Aplicar Regras de Segurança

1. No Firebase Console, vá para **Firestore Database**
2. Clique em **"Rules"** (no topo)
3. Substitua todo o conteúdo por:

```firestore-rules
rules_version = '3';
service cloud.firestore {
  match /databases/{database}/documents {
    // ── Transactions: Cada usuário vê apenas suas próprias ──────────────
    match /transactions/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid != null && 
                       request.auth.uid == request.resource.data.userId &&
                       request.resource.data.keys().hasAll(['userId', 'date', 'amount', 'type', 'title']);
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

4. Clique em **"Publish"**

Essas regras garantem que:
- ✅ Usuários veem apenas suas próprias transações
- ✅ Apenas transações válidas podem ser criadas
- ✅ Usuários só podem modificar/deletar suas próprias transações

## Passo 10: Deploy no Vercel

### Opção A: GitHub + Vercel (Automático)

1. Push seu código para GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Finanças Duo com Firebase"
   git remote add origin https://github.com/seu-usuario/financas-duo.git
   git push -u origin main
   ```

2. Vá para https://vercel.com/new
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente (mesmo `.env.local`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Deploy! 🚀

### Opção B: Vercel CLI

```bash
npm i -g vercel
cd ~/Desktop/financas-duo
vercel
# Siga as instruções
# Configure as variáveis de ambiente no painel do Vercel
```

## 🎯 Fluxo da App

1. **Novo usuário**: SignUp com email + senha
2. **Firebase Auth**: Cria usuário automaticamente
3. **Login**: Entra com suas credenciais
4. **Transações**: Todos os dados salvos no Firestore em tempo real
5. **Multi-device**: Acesse de qualquer dispositivo com a mesma conta

## 📊 Estrutura do Banco (Firestore)

### Coleção: `transactions`

Cada documento representa uma transação com os campos:
- `userId` (string) - ID do usuário autenticado
- `title` (string) - Título da transação
- `description` (string) - Descrição
- `date` (string) - Data em formato ISO (YYYY-MM-DD)
- `amount` (number) - Valor (positivo para entrada, negativo para saída)
- `type` (string) - 'income', 'expense' ou 'transfer'
- `category` (string) - Categoria (ex: 'Aluguel', 'Comida')
- `subcategory` (string) - Subcategoria
- `profile` (string) - 'PF' ou 'PJ'
- `paymentMethod` (string) - Método de pagamento
- `hasReceipt` (boolean) - Se tem recebimento
- `isRecurring` (boolean) - Se é recorrente
- `tags` (array) - Array de tags
- `createdAt` (string) - Timestamp de criação
- `updatedAt` (string) - Timestamp de atualização

## ❓ Troubleshooting

**Erro: "Missing Firebase environment variables"**
- Verifique se `.env.local` está na raiz do projeto
- Verifique se todas as 6 variáveis estão definidas
- Reinicie o servidor (`npm run dev`)

**Erro ao fazer login: "Auth error"**
- Verifique se autenticação Email/Password está habilitada no Firebase
- Verifique se o usuário foi criado (vá em Authentication → Users)

**Transações não salvam**
- Verifique se você fez login
- Abra o console do navegador (F12) e procure por erros
- Verifique as Firestore Rules (deve estar em modo teste ou rules customizadas)
- Verifique se a coleção `transactions` foi criada

**Erro de permissão ao salvar (403 Forbidden)**
- Suas Firestore Rules estão muito restritivas
- Use o modo teste (durante desenvolvimento) ou atualize as rules
- Certifique-se que `userId` está sendo definido corretamente

## 🔒 Segurança (Security Rules)

- Cada usuário vê **apenas suas próprias transações**
- Firestore Security Rules (equivalente ao RLS do Supabase) ativadas
- API key só acessa dados do próprio usuário
- Transações precisam de `userId` válido para serem criadas

## 🎉 Pronto!

Sua app está **100% funcional com dados na nuvem, gratuita e escalável!**

Próximos passos opcionais:
- Adicionar upload de extratos (CSV, PDF)
- Relatórios avançados
- Gráficos de projeção
- Integração com contas bancárias
- App mobile com React Native
- Migração de dados de outras ferramentas
