# 🔗 [Live Demo: vision-tutor.vercel.app](https://vision-tutor.vercel.app/)

# 🧠 VisionTutor - Multimodal AI Tutoring Platform

> Real-time AI-Powered Assistance for Coding and Math using Vision + Audio + Text

![Banner](Repo_images/Home%20page.jpg)

## 🚀 Overview

**VisionTutor** is a cutting-edge web application that provides **real-time, multimodal tutoring support** using audio, image, and text input. The platform is powered by **Google Gemini models** and offers two interactive environments:

- ✨ **VisionCode**: An AI-aware code editor for debugging, explanations, and live assistance  
- 📐 **VisionMath**: A drawing board that lets users write equations or diagrams and get instant help

It leverages **WebSocket** connections and **real-time APIs** for instant communication and low-latency feedback.

---

## ✨ Key Features

- 🖥️ Real-time screen understanding and reasoning (via Gemini Vision)
- 🎤 Audio input + text transcription support using Gemini-1.5-Flash
- ✍️ Interactive whiteboard for math problem solving
- 🧑‍💻 Live coding editor with code-aware chat and feedback
- ⚡ Low-latency WebSocket communication using Python backend

---

## 🧩 Architecture

![Architecture](Repo_images/Project%20workflow.jpg)

| Component       | Description |
|----------------|-------------|
| **Frontend**    | Built with **Next.js**, includes VisionCode and VisionMath platforms |
| **Backend**     | WebSocket server using **Python**, integrated with Gemini APIs |
| **AI Models**   | Gemini-2.0-Pro for multimodal reasoning, Gemini-1.5-Flash for transcription |
| **Communication** | Real-time bi-directional via WebSockets |

---

## 🛠️ Technologies Used

| Category        | Tech Stack |
|----------------|------------|
| Frontend        | Next.js, Tailwind CSS, Vercel Hosting |
| Backend         | Python, WebSocket, REST API |
| AI Models       | Google Gemini API (2.0-pro, 1.5-flash) |
| Realtime Stack  | WebSocket, Event Loop Handling |
| DevOps          | Vercel, GitHub Actions (CI/CD)

---

## 🔍 Use Case Flow

![Model Architecture](Repo_images/Model%20Architecture.jpg)

1. **User Input**: Voice or visual query (diagram/code)
2. **Processing**: Realtime transcription + Gemini inference
3. **Response**: AI tutor gives personalized feedback and explanations
4. **Output Modes**: Visual response + speech + text

---

## 🖼️ UI Preview

| VisionCode (Desktop) | VisionMath (Desktop) |
|----------------------|----------------------|
| ![Code Editor](Repo_images/Code%20Editor.jpg) | ![Math Canvas](Repo_images/Math%20Canvas.jpg) |

| Mobile View |
|-------------|
| ![Mobile View](Repo_images/Mobile%20view.png) |

---


## 📈 Achievements

- 🚀 **Innovative Multimodal AI** with real-time context understanding
- 🧠 Integrated both code and math visual reasoning on a single platform
- ⚡ **Low-latency switching** between Gemini-2.0 and Gemini-1.5 APIs
- 🧪 Built for seamless classroom and solo learning use cases

---

## 📌 Future Plans

- 🧩 Support for additional STEM subjects (Physics Diagrams, Chemistry Equations)
- 🌐 Language Localization for regional users
- 📝 Export session transcripts and audio logs
- 🔒 Enhanced user authentication and dashboard analytics

---

## 🙌 Credits

- Built by **Sunil Gopal C V**  
- [LinkedIn](https://www.linkedin.com/in/sunil-gopal-c-v/) • [Email](mailto:sunilgopal63@gmail.com)

---

> “VisionTutor isn't just an app — it's a live AI mentor in your browser.”

