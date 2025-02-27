# Bettercaption

Bettercaption is an AI-powered image enhancement and social media sharing web application that provides intelligent content creation tools with cross-platform functionality.

## Key Technologies:
- React.js frontend with responsive mobile design
- Node.js backend with robust authentication
- OpenAI API for intelligent image processing
- Secrets management for API key integration
- Cross-platform image upload and sharing capabilities

## Preview

![Screenshot 2025-02-24 at 10 15 09 p m](https://github.com/user-attachments/assets/9adf7237-652f-4b0b-8be4-23bb4cb245d5)

## Getting Started

### Prerequisites

#### 1. Add OpenAI API Key
To use the image enhancement and caption generation features, you need an OpenAI API key:

**For Replit:**
- Run this command in the Replit Shell:
```
ask_secrets(
    secret_keys=["OPENAI_API_KEY"],
    user_message="Please provide your OpenAI API key to enable AI image enhancement and caption generation features."
)
```

**For local development:**
- Create a `.env` file in the root directory
- Add your OpenAI API key: `OPENAI_API_KEY=your_key_here`

#### 2. Create PostgreSQL Database

**For Replit:**
- Run this command in the Replit Shell:
```
create_postgresql_database_tool()
```

**For local development:**
- Install PostgreSQL on your machine
- Create a database and add the connection details to your `.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/bettercaption
```

#### 3. Initialize Database Schema
Run this command to set up the database tables:
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