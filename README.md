# Bettercaption

Bettercaption is a web-based AI-powered image enhancement and social media sharing platform built with React.js, TypeScript, and the Shadcn UI library. It provides intelligent content creation tools with cross-platform functionality.

## Features

- AI-powered image enhancement and caption generation
- Cross-platform image upload and sharing
- Dark mode and theme customization
- Tiered pricing model with flexible service levels
- Secure user authentication
- Analytics and performance tracking

## Key Technologies

- **Frontend**: React.js with TypeScript
- **UI Framework**: Shadcn UI + Tailwind CSS
- **Backend**: Node.js + Express
- **AI Integration**: OpenAI API
- **Authentication**: Secure session management
- **Database**: PostgreSQL

## Preview

![Screenshot 2025-02-24 at 10 15 09 p m](https://github.com/user-attachments/assets/9adf7237-652f-4b0b-8be4-23bb4cb245d5)

## Getting Started

### Prerequisites

#### 1. Set up OpenAI API
1. Create an account at [OpenAI's platform](https://platform.openai.com/).
2. Navigate to the API section and create a new API key.
3. Add the API key to your project using the secrets manager in Replit:
   - Go to "Secrets" in the left sidebar of your Replit project
   - Add a new secret with the key `OPENAI_API_KEY` and your API key as the value
   - Alternatively, you can use the following command in your Replit shell:
   ```
   ask_secrets(
     secret_keys=["OPENAI_API_KEY"],
     user_message="Please provide your OpenAI API key to enable AI image enhancement and caption generation features."
   )
   ```

#### 2. Set up PostgreSQL Database
1. Create a PostgreSQL database using the Replit tool from your Replit shell:
   ```
   create_postgresql_database_tool()
   ```

2. After creation, the system will have the following environment variables automatically set:
   - `DATABASE_URL`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `PGHOST`

#### 3. Initialize Database Schema
Run the database migration command to set up the tables:
```
npm run db:push
```

### Installation and Running

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## License

MIT License - see the [LICENSE](LICENSE) file for details.