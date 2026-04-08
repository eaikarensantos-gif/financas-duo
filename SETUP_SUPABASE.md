# 🚀 Setup Finanças Duo + Supabase

## Passo 1: Criar as Tabelas no Supabase

1. Acesse seu Supabase Dashboard: https://app.supabase.com
2. Clique no seu projeto **aopenyxqvfdlfmbjkduyu**
3. Vá para **SQL Editor** (ícone de > no sidebar esquerdo)
4. Clique em **"New Query"**
5. Cole TODO o conteúdo do arquivo `supabase-migrations.sql` (está na raiz do projeto)
6. Clique em **"Run"** (ou Ctrl+Enter)
7. ✅ Tabelas criadas!

## Passo 2: Ativar Email Authentication

1. No Supabase Dashboard, vá para **Authentication → Providers**
2. Certifique-se que **Email** está **habilitado** (deve estar por padrão)
3. Vá para **Email Templates** → verifique o template de confirmação

## Passo 3: Variáveis de Ambiente

O arquivo `.env.local` já foi criado com:
```
VITE_SUPABASE_URL=https://aopenyxqvfdlfmbjkduyu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Não compartilhe a chave secreta (service_role_key) publicamente!**

## Passo 4: Rodar Localmente

```bash
cd ~/Desktop/financas-duo
npm run dev
```

Abra: http://localhost:5173

## Passo 5: Deploy no Vercel

### Opção A: GitHub + Vercel (Automático)

1. Push seu código para GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Finanças Duo com Supabase"
   git remote add origin https://github.com/seu-usuario/financas-duo.git
   git push -u origin main
   ```

2. Vá para https://vercel.com/new
3. Importe seu repositório do GitHub
4. Configure variáveis de ambiente:
   - `VITE_SUPABASE_URL`: https://aopenyxqvfdlfmbjkduyu.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: (sua chave anon)
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
2. **Confirmação**: Verifica email (Supabase envia)
3. **Login**: Entra com suas credenciais
4. **Transações**: Todos os dados salvos no Supabase em tempo real
5. **Multi-device**: Acesse de qualquer dispositivo com a mesma conta

## 📊 Estrutura do Banco

### Tabela: `profiles`
- `id` (uuid) - referencia auth.users
- `email` (text)
- `created_at` (timestamp)

### Tabela: `transactions`
- `id` (uuid)
- `user_id` (uuid) - FK para profiles
- `profile` (PF ou PJ)
- `type` (income, expense, transfer)
- `title`, `description`, `date`, `amount`
- `category`, `subcategory`, `payment_method`
- `has_receipt`, `is_recurring`, `tags`
- `created_at`, `updated_at`

## 🔒 Segurança (RLS)

- Cada usuário vê **apenas suas próprias transações**
- Políticas Row Level Security (RLS) ativadas por padrão
- API anon_key só acessa dados do próprio usuário

## ❓ Troubleshooting

**Erro: "Missing Supabase environment variables"**
- Verifique se `.env.local` está na raiz do projeto
- Reinicie o servidor (`npm run dev`)

**Erro ao criar tabelas no SQL**
- Copie TUDO do arquivo `supabase-migrations.sql`
- Execute no SQL Editor do Supabase

**Transações não salvam**
- Verifique se você fez login
- Abra o console do navegador (F12) e procure por erros
- Verifique as permissões RLS no Supabase Dashboard

## 🎉 Pronto!

Sua app está **100% funcional com dados na nuvem, gratuita e escalável!**

Próximos passos opcionais:
- Adicionar upload de extratos (CSV, PDF)
- Relatórios avançados
- Gráficos de projeção
- Integração com contas bancárias
- App mobile com React Native

