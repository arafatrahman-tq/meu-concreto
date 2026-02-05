# Agendamento de Mensagens Automáticas (Cron Job)

O sistema "Meu Concreto" utiliza uma rota de API para processar e disparar as notificações automáticas configuradas. Para garantir que os avisos de **Contas a Pagar**, **Cobranças** e **Novos Orçamentos** sejam enviados diariamente, você deve configurar um Cron Job no seu servidor.

### Endpoint de Gatilho
A URL que deve ser chamada é:
`GET /api/whatsapp/jobs/process-notifications`

---

### Configuração em Servidor Linux (Crontab)

Recomendamos configurar o gatilho para rodar uma vez por dia (ex: às 08:00 AM).

1. Abra o terminal do servidor.
2. Digite `crontab -e`.
3. Adicione a seguinte linha ao final do arquivo:

```bash
0 8 * * * curl -X GET "https://seu-dominio.com/api/whatsapp/jobs/process-notifications" -H "x-cron-secret: SUA_CHAVE_AQUI"
```

*Nota: Utilize a chave definida na variável de ambiente `CRON_SECRET`. Se não definida, a chave padrão é `meu-concreto-cron-key-2026`.*

---

### Configuração em Servidores Windows (Task Scheduler)

1. Abra o **Agendador de Tarefas**.
2. Crie uma **Tarefa Básica**.
3. Defina a frequência como **Diariamente**.
4. Na ação, escolha **Iniciar um Programa**.
5. No programa/script, digite `powershell`.
6. Nos argumentos, adicione:
   `-Command "Invoke-WebRequest -Uri 'https://seu-dominio.com/api/whatsapp/jobs/process-notifications' -Method Get -Headers @{'x-cron-secret'='SUA_CHAVE_AQUI'}"`

---

### Por que usar um gatilho externo?
Como o Nuxt roda em uma arquitetura de servidor web, o uso de um Cron Job externo (via `curl` ou `Invoke-WebRequest`) é a forma mais robusta e eficiente de garantir que o banco de dados seja verificado sem sobrecarregar a memória do processo principal da aplicação.
