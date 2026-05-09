# Lista de Tarefas — React + Java Spring Boot

Aplicação CRUD básico.

## Estrutura

```
todo-app/
├── backend/          ← Spring Boot (Java 17)
│   ├── pom.xml
│   └── src/main/java/com/todo/app/
│       ├── TodoApplication.java
│       ├── controller/TaskController.java
│       ├── model/Task.java
│       ├── repository/TaskRepository.java
│       └── service/TaskService.java
│
└── frontend/         ← React 18 + Vite
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── App.css
```

## Como rodar

### Backend (Spring Boot)

Requisitos: **Java 17+** e **Maven 3.8+**

```bash
cd backend
mvn spring-boot:run
```

O servidor sobe em `http://localhost:8080`.  
Console H2 disponível em `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:tododb`).

### Frontend (React + Vite)

Requisitos: **Node.js 18+**

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

> O Vite está configurado com proxy: todas as chamadas `/api/*` são redirecionadas automaticamente para o Spring Boot na porta 8080.

## API REST

| Método | Rota                    | Descrição                  |
|--------|-------------------------|----------------------------|
| GET    | `/api/tasks`            | Listar todas               |
| GET    | `/api/tasks?filter=active` | Somente pendentes       |
| GET    | `/api/tasks?filter=done`   | Somente concluídas      |
| POST   | `/api/tasks`            | Criar tarefa `{ "text": "…" }` |
| PATCH  | `/api/tasks/{id}/toggle`| Alternar done/pendente     |
| DELETE | `/api/tasks/{id}`       | Remover tarefa             |
| DELETE | `/api/tasks/done`       | Limpar todas concluídas    |

## Banco de dados

Por padrão usa **H2 em memória** (dados são perdidos ao reiniciar).  
Para produção, troque em `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tododb
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

Adicione também a dependência do PostgreSQL no `pom.xml`:

```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>
```