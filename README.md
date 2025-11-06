# Nairobi Digs Connect

A modern web application for connecting people with rental properties in Nairobi.

## 🚀 Features

- **Property Listings**: Browse available properties in Nairobi
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Shadcn UI components
- **Type Safety**: Written in TypeScript for better developer experience

## 🌐 Live Demo

- **Production**: [https://nairobi-digs-connect.lovable.app](https://nairobi-digs-connect.lovable.app)
- **Local Development**   http://192.168.0.103:8080/.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Language**: TypeScript
- **Form Handling**: React Hook Form
- **State Management**: React Context

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nairobi-digs-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the necessary environment variables:
   ```
   VITE_API_URL=your_api_url_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:8080](http://localhost:8080)

## 🏗️ Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── styles/        # Global styles and Tailwind config
└── types/         # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
