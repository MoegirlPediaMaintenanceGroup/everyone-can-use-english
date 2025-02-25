type ConversationType = {
  id: string;
  type: "gpt" | "tts";
  engine: "enjoyai" | "openai" | "ollama" | "googleGenerativeAi";
  name: string;
  configuration: { [key: string]: any };
  model: string;
  language?: string;
  messages?: MessageType[];
  createdAt?: string;
};
