# Bettercaption

Bettercaption is an AI-powered image enhancement and social media sharing web application that provides intelligent content creation tools with cross-platform functionality.

## Key Technologies:
- React.js frontend with responsive mobile design
- Node.js backend with robust authentication
- OpenAI API for intelligent image processing
- Dark mode and theme toggle support
- Cross-platform image upload and sharing capabilities
- Comprehensive pricing model with tiered service levels
- Mobile-friendly responsive header with side navigation

## Preview

![Screenshot 2025-02-24 at 10 15 09 p m](https://github.com/user-attachments/assets/9adf7237-652f-4b0b-8be4-23bb4cb245d5)

## Getting Started

### Prerequisites

#### 1. Add OpenAI API Key
```
ask_secrets(
  secret_keys=["OPENAI_API_KEY"],
  user_message="Please provide your OpenAI API key to enable AI image enhancement and caption generation features."
)
```

#### 2. Create PostgreSQL Database
```
create_postgresql_database_tool()
```

#### 3. Initialize Database Schema
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